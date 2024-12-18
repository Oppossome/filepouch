import type { Handle } from "@sveltejs/kit"

import { type DBProvider, initDbProvider } from "$lib/server/db"
import { initAuthProvider } from "$lib/server/auth"

// MARK: Initialization

const dbProvider: DBProvider = await initDbProvider()

// MARK: Request Handling

export const handle: Handle = async ({ event, resolve }) => {
	// Initialize the server locals
	const db = await dbProvider(event)
	const server = { auth: initAuthProvider(db), db }
	event.locals.server = server

	// Retrieve the session token from the cookies
	const sessionToken = event.cookies.get(server.auth.sessionCookieName)
	if (!sessionToken) {
		event.locals.user = null
		event.locals.session = null
		return resolve(event)
	}

	// Validate the session token
	const { session, user } = await server.auth.validateSessionToken(sessionToken)
	if (session) {
		server.auth.setSessionTokenCookie(event, sessionToken, session.expiresAt)
	} else {
		server.auth.deleteSessionTokenCookie(event)
	}

	// Attach the user and session to the event
	event.locals.user = user
	event.locals.session = session

	return resolve(event)
}
