import { hash, verify } from "@node-rs/argon2"
import { encodeHexLowerCase } from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"
import type { RequestEvent } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

import { randomStr } from "$lib/utils"

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

			// Hash the session token to use as the session ID that's stored in the database
			// This way, even if the database is compromised, the session tokens are not exposed
			const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)))
			const [dbResult] = await db.client
				.insert(db.tables.session)
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
			// Hash the session token to use as the session ID that's stored in the database
			const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)))

			// Retrieve the session and user data from the database
			const [dbResult] = await db.client
				.select({
					// Adjust user table here to tweak returned data
					user: { id: db.tables.user.id, username: db.tables.user.username },
					session: db.tables.session,
				})
				.from(db.tables.session)
				.innerJoin(db.tables.user, eq(db.tables.session.userId, db.tables.user.id))
				.where(eq(db.tables.session.id, sessionId))
				.limit(1)

			if (!dbResult) return { session: null, user: null }
			const { session, user } = dbResult

			// Delete session if it's expired
			const sessionExpired = Date.now() >= session.expiresAt.getTime()
			if (sessionExpired) {
				await db.client.delete(db.tables.session).where(eq(db.tables.session.id, session.id))
				return { session: null, user: null }
			}

			// Renew session if it's within 15 days of expiring
			const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15
			if (renewSession) {
				session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30)
				await db.client
					.update(db.tables.session)
					.set({ expiresAt: session.expiresAt })
					.where(eq(db.tables.session.id, session.id))
			}

			return { session, user }
		},
		invalidateSession: async (sessionId: string) => {
			return db.client.delete(db.tables.session).where(eq(db.tables.session.id, sessionId))
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
