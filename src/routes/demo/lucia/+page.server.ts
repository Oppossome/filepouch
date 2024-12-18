import { fail, redirect } from "@sveltejs/kit"

import * as server from "$lib/server"

import type { Actions, PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, "/demo/lucia/login")
	}
	return { user: event.locals.user }
}

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) return fail(401)

		// Invalidate the session
		await server.auth.invalidateSession(event.locals.session.id)
		server.auth.deleteSessionTokenCookie(event)

		// Redirect to the login page
		return redirect(302, "/demo/lucia/login")
	},
}
