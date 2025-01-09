import { redirect } from "@sveltejs/kit"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const { auth } = event.locals.server

	if (event.locals.session) {
		await auth.invalidateSession(event.locals.session.id)
		auth.deleteSessionTokenCookie(event)
	}

	redirect(302, "/login")
}
