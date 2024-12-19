import { type Page } from "@playwright/test"

import { expect, test } from "./meta/fixture"

async function fillForm(page: Page, form: Record<string, string>) {
	for (const [label, value] of Object.entries(form)) {
		const input = page.getByLabel(label, { exact: true })
		await input.fill(value)
	}
}

test("Registering a new user", async ({ db, page }) => {
	await page.goto("/register")

	// Fill out account creation form
	await fillForm(page, { Username: "test", Password: "password", "Confirm Password": "password" })
	await page.getByText("Submit").click()
	await page.waitForURL(/^.*\/user/)

	// Check the database
	const dbResult = await db.client.select().from(db.schema.user)
	expect(dbResult).toHaveLength(1)
	expect(dbResult[0].username).toBe("test")
})
