import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import type { RequestEvent } from "@sveltejs/kit"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "$env/dynamic/private"

import * as tables from "$lib/server/db/schema"

export type DBProvider = (event: RequestEvent) => Promise<{
	client: PostgresJsDatabase
	tables: typeof tables
}>

export async function initDbProvider(): Promise<DBProvider> {
	switch (true) {
		// Playwright test database provider
		// Connects to a new database for each playwright test as specified by the X-Playwright-DB header
		case import.meta.env.MODE === "development" && env.PW_TEST !== undefined: {
			const dbClients = new Map<string, PostgresJsDatabase>()

			return async (event) => {
				// Retrieve the database name from the cookie
				const eventDbUrl = event.request.headers.get("X-Playwright-DB")
				if (!eventDbUrl) throw new Error("X-Playwright-DB header is not set")

				const dbClient = dbClients.get(eventDbUrl)
				if (dbClient) return { client: dbClient, tables: tables }

				// Initialize a new database client for the playwright test
				const postgresClient = postgres(eventDbUrl)
				const newDbClient = drizzle(postgresClient)

				dbClients.set(eventDbUrl, newDbClient)
				return { client: newDbClient, tables: tables }
			}
		}

		// Typical database provider for production and development environments.
		case env.DATABASE_URL !== undefined: {
			const postgresClient = postgres(env.DATABASE_URL)
			const dbClient = drizzle(postgresClient)

			return async () => ({
				client: dbClient,
				tables,
			})
		}

		// Unable to determine the database provider
		default:
			throw new Error("DATABASE_URL is not set")
	}
}
