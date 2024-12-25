import { eq } from "drizzle-orm"
import { redirect } from "@sveltejs/kit"
import { fail, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

import type { PageServerLoad, Actions } from "./$types"
import { loginSchema } from "../schema"

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		redirect(302, "/user/" + event.locals.user.id)
	}
}

export const actions: Actions = {
	default: async (event) => {
		const server = event.locals.server

		// Validate the form
		const form = await superValidate(event, zod(loginSchema))
		if (!form.valid) return fail(400, { form })

		// Retrieve user from database
		const [dbResult] = await server.db.client
			.select()
			.from(server.db.schema.user)
			.where(eq(server.db.schema.user.username, form.data.username))
			.limit(1)

		if (!dbResult) return setError(form, "username", "Incorrect username or password")

		// Check if the password is correct
		const validPassword = await server.auth.verifyPassword(
			dbResult.passwordHash,
			form.data.password,
		)
		if (!validPassword) return setError(form, "username", "Incorrect username or password")

		// Begin a new session
		const { token, session } = await server.auth.createSession(dbResult.id)
		server.auth.setSessionTokenCookie(event, token, session.expiresAt)

		// Redirect to the user's page
		redirect(303, "/user/" + dbResult.id)
	},
}
