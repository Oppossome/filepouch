import { eq } from "drizzle-orm"
import { redirect } from "@sveltejs/kit"
import { fail, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

import type { PageServerLoad, Actions } from "./$types"
import { registerSchema } from "./form.svelte"

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, "/user/" + event.locals.user.id)
	}
}

export const actions: Actions = {
	default: async (event) => {
		const server = event.locals.server

		// Validate the form
		const form = await superValidate(event, zod(registerSchema))
		if (!form.valid) return fail(400, { form })

		// Check if the username already exists
		const [dbResult] = await server.db.client
			.select()
			.from(server.db.tables.user)
			.where(eq(server.db.tables.user.username, form.data.username))
			.limit(1)

		if (dbResult) return setError(form, "username", "Username already exists")

		try {
			// Hash the password
			const passwordHash = await server.auth.hashPassword(form.data.password)
			const [dbResult] = await server.db.client
				.insert(server.db.tables.user)
				.values({
					username: form.data.username,
					passwordHash,
				})
				.returning()

			// Begin a new session
			const session = await server.auth.createSession(dbResult.id)
			server.auth.setSessionTokenCookie(event, session.id, session.expiresAt)

			// Redirect to the user's page
			return redirect(302, "/user/" + dbResult.id)
		} catch {
			return fail(500, { message: "An error occurred" })
		}
	},
}
