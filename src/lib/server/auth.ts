import { hash, verify } from "@node-rs/argon2"
import type { RequestEvent } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

import { hashStr, randomStr } from "$lib/utils"

const DAY_IN_MS = 1000 * 60 * 60 * 24

export const sessionCookieName = "auth-session"

export type SessionValidationResult = Awaited<ReturnType<AuthProvider["validateSessionToken"]>>

export class AuthProvider {
	private db: App.Locals["server"]["db"]

	constructor(db: App.Locals["server"]["db"]) {
		this.db = db
	}

	// MARK: Session Handlers
	async createSession(userId: string) {
		const sessionToken = randomStr(32)
		const sessionId = hashStr(sessionToken)

		const [dbResult] = await this.db.client
			.insert(this.db.schema.session)
			.values({
				id: sessionId,
				userId,
				expiresAt: new Date(Date.now() + DAY_IN_MS * 30),
			})
			.returning()

		return {
			token: sessionToken,
			session: dbResult,
		}
	}

	async validateSessionToken(sessionToken: string) {
		const sessionId = hashStr(sessionToken)
		const [dbResult] = await this.db.client
			.select({
				user: this.db.schema.user,
				session: this.db.schema.session,
			})
			.from(this.db.schema.session)
			.innerJoin(this.db.schema.user, eq(this.db.schema.session.userId, this.db.schema.user.id))
			.where(eq(this.db.schema.session.id, sessionId))
			.limit(1)

		if (!dbResult) {
			return { session: null, user: null }
		}

		const { session, user } = dbResult
		const sessionExpired = Date.now() >= session.expiresAt.getTime()
		if (sessionExpired) {
			await this.db.client
				.delete(this.db.schema.session)
				.where(eq(this.db.schema.session.id, session.id))
			return { session: null, user: null }
		}

		// Renew session if it's within 15 days of expiring
		const renewSession = Date.now() >= session.expiresAt.getTime() - DAY_IN_MS * 15
		if (renewSession) {
			session.expiresAt = new Date(Date.now() + DAY_IN_MS * 30)
			await this.db.client
				.update(this.db.schema.session)
				.set({ expiresAt: session.expiresAt })
				.where(eq(this.db.schema.session.id, session.id))
		}

		return { session, user }
	}

	async invalidateSession(sessionId: string) {
		return this.db.client
			.delete(this.db.schema.session)
			.where(eq(this.db.schema.session.id, sessionId))
	}

	// MARK: Cookie Handlers
	getSessionTokenCookie(event: RequestEvent) {
		return event.cookies.get(sessionCookieName)
	}

	setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date) {
		event.cookies.set(sessionCookieName, token, {
			expires: expiresAt,
			path: "/",
		})
	}

	deleteSessionTokenCookie(event: RequestEvent) {
		event.cookies.delete(sessionCookieName, {
			path: "/",
		})
	}

	// MARK: Password Handlers
	hashPassword(password: string) {
		return hash(password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		})
	}

	verifyPassword(hash: string, password: string) {
		return verify(hash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1,
		})
	}
}
