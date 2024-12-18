import { redirect } from "@sveltejs/kit"

import * as server from "$lib/server"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	if (event.locals.session) {
		await server.auth.invalidateSession(event.locals.session.id)
		server.auth.deleteSessionTokenCookie(event)
	}

	return redirect(302, "/login")
}
