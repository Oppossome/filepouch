import { redirect } from "@sveltejs/kit"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const server = event.locals.server

	if (event.locals.session) {
		await server.auth.invalidateSession(event.locals.session.id)
		server.auth.deleteSessionTokenCookie(event)
	}

	redirect(302, "/login")
}
