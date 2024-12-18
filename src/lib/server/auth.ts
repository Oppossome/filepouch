import { hash, verify } from "@node-rs/argon2"
import type { RequestEvent } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

import * as db from "$lib/server/db"

const DAY_IN_MS = 1000 * 60 * 60 * 24

export const sessionCookieName = "auth-session"

// MARK: Session Handling

export async function createSession(userId: string) {
	const [dbResult] = await db.client
		.insert(db.table.session)
		.values({ userId, expiresAt: new Date(Date.now() + DAY_IN_MS * 30) })
		.returning()

	return dbResult
}

export async function validateSessionToken(token: string) {
	const [dbResult] = await db.client
		.select({
			// Adjust user table here to tweak returned data
			user: { id: db.table.user.id, username: db.table.user.username },
			session: db.table.session,
		})
		.from(db.table.session)
		.innerJoin(db.table.user, eq(db.table.session.userId, db.table.user.id))
		.where(eq(db.table.session.id, token))
		.limit(1)

	if (!dbResult) return { session: null, user: null }
	const { session, user } = dbResult

	// Delete session if it's expired
	const sessionExpired = Date.now() >= session.expiresAt.getTime()
	if (sessionExpired) {
		await db.client.delete(db.table.session).where(eq(db.table.session.id, session.id))
		return { session: null, user: null }
	}

	// Renew session if it's within 15 days of expiring
	const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15
	if (renewSession) {
		session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30)
		await db.client
			.update(db.table.session)
			.set({ expiresAt: session.expiresAt })
			.where(eq(db.table.session.id, session.id))
	}

	return { session, user }
}

export type SessionValidationResult = Awaited<ReturnType<typeof validateSessionToken>>

export async function invalidateSession(sessionId: string) {
	return db.client.delete(db.table.session).where(eq(db.table.session.id, sessionId))
}

// MARK: Cookie Handling

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
	event.cookies.set(sessionCookieName, token, {
		expires: expiresAt,
		path: "/",
	})
}

export function deleteSessionTokenCookie(event: RequestEvent) {
	event.cookies.delete(sessionCookieName, {
		path: "/",
	})
}

// MARK: Password Handling

export function hashPassword(password: string) {
	return hash(password, {
		// Recommended Minimum Parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	})
}

export function verifyPassword(hash: string, password: string) {
	return verify(hash, password, {
		// Recommended Minimum Parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1,
	})
}
