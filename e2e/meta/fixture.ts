import { spawn } from "child_process"
import { env } from "process"

import { drizzle } from "drizzle-orm/postgres-js"
import { test as base } from "@playwright/test"
import postgres from "postgres"

import * as schema from "$lib/server/database.schema"
import { DatabaseSeeder } from "$lib/server/database.seed"

async function createDatabase() {
	const databaseID = crypto.randomUUID().replace(/(\d|-)/g, "")

	// Create the database
	const postgresClient = postgres(env.DATABASE_URL!)
	await postgresClient.unsafe(`CREATE DATABASE ${databaseID}`)
	await postgresClient.end()

	// Push the schema to the new database
	const databaseURL = `${env.DATABASE_URL}/${databaseID}`
	await new Promise<void>((resolve, reject) => {
		const process = spawn("pnpm", ["db:push", "--force"], {
			// stdio: "inherit", // Uncomment this line to see the output of the db:push command
			env: { ...env, DATABASE_URL: databaseURL },
		})

		process.on("close", (code) => {
			if (code === 0) return resolve()
			reject(new Error(`Process exited with code ${code}`))
		})
	})

	// Return the postgres client for the new database
	return {
		url: databaseURL,
		client: postgres(databaseURL),
	}
}

interface Fixture {
	db: App.Locals["server"]["db"] & { seeder: DatabaseSeeder }
}

export const test = base.extend<Fixture>({
	db: async ({ page }, use) => {
		// Create a new database for the test
		const { url, client } = await createDatabase()

		// Set the database ID as a header, so the server knows which database to use
		await page.setExtraHTTPHeaders({ "X-Playwright-DB": url })

		const drizzleClient = drizzle(client)
		await use({ client: drizzleClient, schema, seeder: new DatabaseSeeder(drizzleClient) })

		// Teardown the database after the test
		await client.end()
	},
})

export { expect } from "@playwright/test"
