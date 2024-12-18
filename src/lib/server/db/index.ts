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
		// Typical database provider for production and development environments.
		case env.DATABASE_URL !== undefined: {
			const postgresClient = postgres(env.DATABASE_URL)
			const dbClient = drizzle(postgresClient)

			return async () => ({
				client: dbClient,
				tables,
			})
		}
		default:
			throw new Error("DATABASE_URL is not set")
	}
}
