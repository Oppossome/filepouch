import { expect, test } from "./meta/fixture"

test("Infinite scrolling should behave as expected", async ({ db, page }) => {
	const [testUser] = await db.seeder.user()
	const testUploads = await db.seeder.upload(50, () => ({ userId: testUser.id }))

	await page.goto(`/users/${testUser.id}`)
	await expect(page.getByText(testUser.username)).toBeVisible()

	const upload = page.locator(".c_upload")
	const firstEndObserver = page.getByTestId("wf-end-observer").nth(0)

	// Scrolling to the end should load ten more items
	for (let i = 1; i <= testUploads.length / 10; i++) {
		await expect(upload).toHaveCount(10 * i)
		await firstEndObserver.scrollIntoViewIfNeeded()
	}

	// There should be no more content
	await expect(firstEndObserver).toHaveCount(0)
})
