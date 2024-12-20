import { type Page } from "@playwright/test"
import { eq } from "drizzle-orm"

import { initAuthProvider, sessionCookieName } from "$lib/server/auth"
import { hashStr } from "$lib/utils"

import { expect, test } from "./meta/fixture"

async function fillForm(page: Page, form: Record<string, string>) {
	for (const [label, value] of Object.entries(form)) {
		const input = page.getByLabel(label, { exact: true })
		await input.fill(value)
	}
}

test.describe("session", () => {
	test("register", async ({ db, page }) => {
		await page.goto("/register")

		await fillForm(page, { Username: "test", Password: "password", "Confirm Password": "password" })
		await page.getByText("Submit").click()
		await page.waitForURL(/^.*\/user/)

		// Check that the user was created in the database
		const dbUsers = await db.client.select().from(db.tables.user)
		expect(dbUsers).toHaveLength(1)
		expect(dbUsers[0].username).toBe("test")
		expect(dbUsers[0].role).toBe("user")

		// Get the session token from the user's cookies
		const userCookies = await page.context().cookies()
		const sessionCookie = userCookies.find((cookie) => cookie.name === sessionCookieName)
		expect(sessionCookie).toBeDefined()
		expect(sessionCookie!.expires).toBeGreaterThan(Date.now() / 1000)

		// Retrieve the associated session from the database
		const dbSessions = await db.client
			.select()
			.from(db.tables.session)
			.where(eq(db.tables.session.id, hashStr(decodeURIComponent(sessionCookie!.value))))

		expect(dbSessions).toHaveLength(1)
		expect(dbSessions[0].userId).toBe(dbUsers[0].id)
		expect(sessionCookie!.expires).toBeCloseTo(dbSessions[0].expiresAt.valueOf() / 1000, -1)
	})

	test("login / logout", async ({ db, page }) => {
		// Register a user in our database
		const authProvider = initAuthProvider(db)
		const [newUser] = await db.client
			.insert(db.tables.user)
			.values({
				username: "test",
				passwordHash: await authProvider.hashPassword("password"),
			})
			.returning()

		// Log in
		await page.goto("/login")
		await fillForm(page, { Username: "test", Password: "password" })
		await page.getByText("Submit").click()
		await page.waitForURL(`**/${newUser.id}`)

		// Get the session token from the user's cookies
		const userCookies = await page.context().cookies()
		const sessionCookie = userCookies.find((cookie) => cookie.name === sessionCookieName)
		expect(sessionCookie).toBeDefined()
		expect(sessionCookie!.expires).toBeGreaterThan(Date.now() / 1000)

		// Retrieve the associated session from the database
		const dbSessions = await db.client
			.select()
			.from(db.tables.session)
			.where(eq(db.tables.session.id, hashStr(decodeURIComponent(sessionCookie!.value))))

		expect(dbSessions).toHaveLength(1)
		expect(dbSessions[0].userId).toBe(newUser.id)
		expect(sessionCookie!.expires).toBeCloseTo(dbSessions[0].expiresAt.valueOf() / 1000, -1)

		// Log out
		await page.goto("/logout")
		await page.waitForURL(/^.*\/login/)

		// Check that the session was invalidated
		const dbSessionsAfterLogout = await db.client.select().from(db.tables.session)
		expect(dbSessionsAfterLogout).toHaveLength(0)

		// Check that the session cookie was deleted
		const cookiesAfterLogout = await page.context().cookies()
		const sessionCookieAfterLogout = cookiesAfterLogout.find(
			(cookie) => cookie.name === sessionCookieName,
		)
		expect(sessionCookieAfterLogout).toBeUndefined()
	})
})
