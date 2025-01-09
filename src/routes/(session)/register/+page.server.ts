import { eq } from "drizzle-orm"
import { redirect } from "@sveltejs/kit"
import { fail, setError, superValidate } from "sveltekit-superforms"
import { zod } from "sveltekit-superforms/adapters"

import type { PageServerLoad, Actions } from "./$types"
import { registerSchema } from "../schema"

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		redirect(302, "/users/" + event.locals.user.id)
	}
}

export const actions: Actions = {
	default: async (event) => {
		const { db, auth } = event.locals.server

		// Validate the form
		const form = await superValidate(event, zod(registerSchema))
		if (!form.valid) return fail(400, { form })

		// Check if the username already exists
		const [existingUser] = await db.client
			.select()
			.from(db.schema.user)
			.where(eq(db.schema.user.username, form.data.username))
			.limit(1)

		if (existingUser) {
			return setError(form, "username", "Username already exists")
		}

		// Hash the password
		const passwordHash = await auth.hashPassword(form.data.password)
		const [newUser] = await db.client
			.insert(db.schema.user)
			.values({
				username: form.data.username,
				passwordHash,
			})
			.returning()

		// Begin a new session
		const { token, session } = await auth.createSession(newUser.id)
		auth.setSessionTokenCookie(event, token, session.expiresAt)

		// Redirect to the user's page
		redirect(302, "/users/" + newUser.id)
	},
}
