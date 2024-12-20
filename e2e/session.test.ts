import { type Page } from "@playwright/test"
import { eq } from "drizzle-orm"

import { initAuthProvider, sessionCookieName } from "$lib/server/auth"
import { hashStr, randomStr } from "$lib/utils"

import { expect, test } from "./meta/fixture"

// Helper function to fill out a form
async function fillForm(page: Page, form: Record<string, string>) {
	for (const [label, value] of Object.entries(form)) {
		const input = page.getByLabel(label, { exact: true })
		await input.fill(value)
	}
}

// MARK: Register
test("Register", async ({ db, page }) => {
	await page.goto("/register")

	await fillForm(page, { Username: "test", Password: "password", "Confirm Password": "password" })
	await page.getByText("Submit").click()
	await page.waitForURL(/^.*\/user/)

	// Check that the user was created in the database
	const dbUsers = await db.client.select().from(db.schema.user)
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
		.from(db.schema.session)
		.where(eq(db.schema.session.id, hashStr(decodeURIComponent(sessionCookie!.value))))

	expect(dbSessions).toHaveLength(1)
	expect(dbSessions[0].userId).toBe(dbUsers[0].id)
	expect(sessionCookie!.expires).toBeCloseTo(dbSessions[0].expiresAt.valueOf() / 1000, -1)
})

// MARK: Login
test("Login", async ({ db, page }) => {
	// Register a user in our database
	const authProvider = initAuthProvider(db)
	const [newUser] = await db.client
		.insert(db.schema.user)
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
		.from(db.schema.session)
		.where(eq(db.schema.session.id, hashStr(decodeURIComponent(sessionCookie!.value))))

	expect(dbSessions).toHaveLength(1)
	expect(dbSessions[0].userId).toBe(newUser.id)
	expect(sessionCookie!.expires).toBeCloseTo(dbSessions[0].expiresAt.valueOf() / 1000, -1)
})

// MARK: Logout
test("Logout", async ({ baseURL, db, page }) => {
	// Register a user in our database
	const authProvider = initAuthProvider(db)
	const [newUser] = await db.client
		.insert(db.schema.user)
		.values({
			username: "test",
			passwordHash: await authProvider.hashPassword("password"),
		})
		.returning()

	// Create a session
	const sessionToken = randomStr(32)
	await db.client.insert(db.schema.session).values({
		id: hashStr(sessionToken),
		userId: newUser.id,
		expiresAt: new Date(Date.now() + 1000),
	})

	// Apply the session token
	await page.context().addCookies([
		{
			url: baseURL,
			name: sessionCookieName,
			value: encodeURIComponent(sessionToken),
		},
	])

	// Log out
	await page.goto("/logout")
	await page.waitForURL(/^.*\/login/)

	// Check that the session was invalidated
	const dbSessionsAfterLogout = await db.client.select().from(db.schema.session)
	expect(dbSessionsAfterLogout).toHaveLength(0)

	// Check that the session cookie was deleted
	const cookiesAfterLogout = await page.context().cookies()
	const sessionCookieAfterLogout = cookiesAfterLogout.find(
		(cookie) => cookie.name === sessionCookieName,
	)
	expect(sessionCookieAfterLogout).toBeUndefined()
})

// MARK: Old Session Refresh
test("Old Session Refresh", async ({ baseURL, db, page }) => {
	// Register a user in our database
	const authProvider = initAuthProvider(db)
	const [newUser] = await db.client
		.insert(db.schema.user)
		.values({
			username: "test",
			passwordHash: await authProvider.hashPassword("password"),
		})
		.returning()

	// Create a session that is about to expire
	const sessionToken = randomStr(32)
	await db.client.insert(db.schema.session).values({
		id: hashStr(sessionToken),
		userId: newUser.id,
		expiresAt: new Date(Date.now() + 1000),
	})

	// Apply the session token
	await page.context().addCookies([
		{
			url: baseURL,
			name: sessionCookieName,
			value: encodeURIComponent(sessionToken),
		},
	])

	// Visit the website
	await page.goto("/")

	// Check that the session was refreshed
	const dbSessionsAfterRefresh = await db.client.select().from(db.schema.session)
	expect(dbSessionsAfterRefresh).toHaveLength(1)
	expect(dbSessionsAfterRefresh[0].userId).toBe(newUser.id)
	expect(dbSessionsAfterRefresh[0].expiresAt.valueOf()).toBeGreaterThan(Date.now() + 6000)

	// Check that the session cookie was refreshed
	const cookiesAfterRefresh = await page.context().cookies()
	const sessionCookieAfterRefresh = cookiesAfterRefresh.find(
		(cookie) => cookie.name === sessionCookieName,
	)
	expect(sessionCookieAfterRefresh).toBeDefined()
	expect(sessionCookieAfterRefresh!.expires).toBeCloseTo(
		dbSessionsAfterRefresh[0].expiresAt.valueOf() / 1000,
		-1,
	)
})

// MARK: Expired Session
test("Expired Session", async ({ baseURL, db, page }) => {
	// Register a user in our database
	const authProvider = initAuthProvider(db)
	const [newUser] = await db.client
		.insert(db.schema.user)
		.values({
			username: "test",
			passwordHash: await authProvider.hashPassword("password"),
		})
		.returning()

	// Create an expired session
	const sessionToken = randomStr(32)
	await db.client.insert(db.schema.session).values({
		id: hashStr(sessionToken),
		userId: newUser.id,
		expiresAt: new Date(Date.now() - 1000),
	})

	// Apply the session token
	await page.context().addCookies([
		{
			url: baseURL,
			name: sessionCookieName,
			value: encodeURIComponent(sessionToken),
		},
	])

	// Visit the website
	await page.goto("/")

	// Check that the session was invalidated
	const dbSessionsAfterLogout = await db.client.select().from(db.schema.session)
	expect(dbSessionsAfterLogout).toHaveLength(0)

	// Check that the session cookie was deleted
	const cookiesAfterLogout = await page.context().cookies()
	const sessionCookieAfterLogout = cookiesAfterLogout.find(
		(cookie) => cookie.name === sessionCookieName,
	)
	expect(sessionCookieAfterLogout).toBeUndefined()
})
