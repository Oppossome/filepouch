import { lt } from "drizzle-orm"
import type { Handle } from "@sveltejs/kit"

import * as server from "$lib/server"

export const init = async () => {
	// Prune expired sessions on startup
	await server.db.client
		.delete(server.db.table.session)
		.where(lt(server.db.table.session.expiresAt, new Date()))
}

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(server.auth.sessionCookieName)
	if (!sessionToken) {
		event.locals.user = null
		event.locals.session = null
		return resolve(event)
	}

	const { session, user } = await server.auth.validateSessionToken(sessionToken)
	if (session) {
		server.auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
	} else {
		server.auth.deleteSessionTokenCookie(event)
	}

	event.locals.user = user
	event.locals.session = session

	return resolve(event)
}
