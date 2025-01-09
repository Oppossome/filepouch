import type { Handle } from "@sveltejs/kit"
import { sequence } from "@sveltejs/kit/hooks"

import { AuthProvider, DatabaseProvider, FileProvider } from "$lib/server"

// MARK: Initialization

const databaseProvider = await DatabaseProvider.init()
const uploadProvider = await FileProvider.init()

const handleInitServer: Handle = async ({ event, resolve }) => {
	const db = await databaseProvider.get(event)
	event.locals.server = {
		db,
		auth: new AuthProvider(db),
		file: uploadProvider,
	}

	// Continue processing the request
	return resolve(event)
}

const handleUserSession: Handle = async ({ event, resolve }) => {
	const server = event.locals.server
	const sessionToken = server.auth.getSessionTokenCookie(event)
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

	// Continue processing the request
	return resolve(event)
}

export const handle = sequence(handleInitServer, handleUserSession)
