import { hash, verify, type Options } from "@node-rs/argon2"
import { fail, redirect } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

import * as server from "$lib/server"

import type { Actions, PageServerLoad } from "./$types"

const HASH_OPTIONS: Options = {
	// Recommended Minimum Parameters
	memoryCost: 19456,
	timeCost: 2,
	outputLen: 32,
	parallelism: 1,
}

// MARK: Load

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) return redirect(302, "/demo/lucia")
	return {}
}

// MARK: Actions

export const actions: Actions = {
	// MARK: - Login
	login: async (event) => {
		const formData = await event.request.formData()
		const username = formData.get("username")
		const password = formData.get("password")

		// Validate the username and password
		if (!validateUsername(username)) return fail(400, { message: "Invalid username" })
		if (!validatePassword(password)) return fail(400, { message: "Invalid password" })

		const [dbResult] = await server.db.client
			.select()
			.from(server.db.table.user)
			.where(eq(server.db.table.user.username, username))
			.limit(1)

		// Check if the user exists
		if (!dbResult) return fail(400, { message: "Incorrect username or password" })

		// Check if the password is correct
		const validPassword = await verify(dbResult.passwordHash, password, HASH_OPTIONS)
		if (!validPassword) return fail(400, { message: "Incorrect username or password" })

		// Begin a new session
		const session = await server.auth.createSession(dbResult.id)
		server.auth.setSessionTokenCookie(event, session.id, session.expiresAt)

		return redirect(302, "/demo/lucia")
	},
	// MARK: - Register
	register: async (event) => {
		const formData = await event.request.formData()
		const username = formData.get("username")
		const password = formData.get("password")

		// Validate the username and password
		if (!validateUsername(username)) return fail(400, { message: "Invalid username" })
		if (!validatePassword(password)) return fail(400, { message: "Invalid password" })

		// Hash the password
		const passwordHash = await hash(password, HASH_OPTIONS)

		// Insert the user into the database
		try {
			const dbResponse = await server.db.client
				.insert(server.db.table.user)
				.values({ username, passwordHash })
				.returning()

			const session = await server.auth.createSession(dbResponse[0].id)
			server.auth.setSessionTokenCookie(event, session.id, session.expiresAt)
		} catch {
			return fail(500, { message: "An error has occurred" })
		}

		// Redirect the user to the dashboard
		return redirect(302, "/demo/lucia")
	},
}

function validateUsername(username: unknown): username is string {
	return (
		typeof username === "string" &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	)
}

function validatePassword(password: unknown): password is string {
	return typeof password === "string" && password.length >= 6 && password.length <= 255
}
