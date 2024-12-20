import { hash, verify } from "@node-rs/argon2"
import type { RequestEvent } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

import { hashStr, randomStr } from "$lib/utils"

const DAY_IN_MS = 1000 * 60 * 60 * 24

export const sessionCookieName = "auth-session"

export type AuthProvider = ReturnType<typeof initAuthProvider>
export type SessionValidationResult = Awaited<ReturnType<AuthProvider["validateSessionToken"]>>

export function initAuthProvider(db: App.Locals["server"]["db"]) {
	return {
		// MARK: Session Handlers
		createSession: async (userId: string) => {
			// Generate a random session token
			const sessionToken = randomStr(32)

			// Hash the session token to use at the session ID
			// This way, even if the database is compromised, the session tokens are not exposed
			const sessionId = hashStr(sessionToken)

			// Insert the session into the database
			const [dbResult] = await db.client
				.insert(db.schema.session)
				.values({
					id: sessionId,
					userId,
					expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
				})
				.returning()

			// Return the session token and the session data
			return {
				token: sessionToken,
				session: dbResult,
			}
		},
		validateSessionToken: async (sessionToken: string) => {
			const sessionId = hashStr(sessionToken)

			// Retrieve the session and user data from the database
			const [dbResult] = await db.client
				.select({
					// Adjust user table here to tweak returned data
					user: { id: db.schema.user.id, username: db.schema.user.username },
					session: db.schema.session,
				})
				.from(db.schema.session)
				.innerJoin(db.schema.user, eq(db.schema.session.userId, db.schema.user.id))
				.where(eq(db.schema.session.id, sessionId))
				.limit(1)

			if (!dbResult) return { session: null, user: null }
			const { session, user } = dbResult

			// Delete session if it's expired
			const sessionExpired = Date.now() >= session.expiresAt.getTime()
			if (sessionExpired) {
				await db.client.delete(db.schema.session).where(eq(db.schema.session.id, session.id))
				return { session: null, user: null }
			}

			// Renew session if it's within 15 days of expiring
			const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15
			if (renewSession) {
				session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30)
				await db.client
					.update(db.schema.session)
					.set({ expiresAt: session.expiresAt })
					.where(eq(db.schema.session.id, session.id))
			}

			return { session, user }
		},
		invalidateSession: async (sessionId: string) => {
			return db.client.delete(db.schema.session).where(eq(db.schema.session.id, sessionId))
		},

		// MARK: Cookie Handlers
		sessionCookieName,
		setSessionTokenCookie: (event: RequestEvent, token: string, expiresAt: Date) => {
			event.cookies.set(sessionCookieName, token, {
				expires: expiresAt,
				path: "/",
			})
		},
		deleteSessionTokenCookie: (event: RequestEvent) => {
			event.cookies.delete(sessionCookieName, {
				path: "/",
			})
		},

		// MARK: Password Handlers
		hashPassword: (password: string) => {
			return hash(password, {
				// Recommended Minimum Parameters
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1,
			})
		},
		verifyPassword: (hash: string, password: string) => {
			return verify(hash, password, {
				// Recommended Minimum Parameters
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1,
			})
		},
	}
}
