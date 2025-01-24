import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import type { RequestEvent } from "@sveltejs/kit"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "$env/dynamic/private"

import * as schema from "./database.schema"

// MARK: Abstract

export abstract class DatabaseProvider {
	abstract get(event: RequestEvent): Promise<{
		client: PostgresJsDatabase
		schema: typeof schema
	}>

	static async init() {
		switch (true) {
			case env.PW_TEST !== undefined:
				if (import.meta.env.MODE !== "development")
					throw new Error("Playwright tests can only run in development")

				return new PlaywrightDatabaseProvider()
			case env.DATABASE_URL !== undefined:
				return new StandardDatabaseProvider(env.DATABASE_URL)
			default:
				throw new Error("DATABASE_URL is not set")
		}
	}
}

// MARK: Standard

/**
 * Standard application database provider
 */
class StandardDatabaseProvider extends DatabaseProvider {
	private dbClient: PostgresJsDatabase

	constructor(databaseUrl: string) {
		super()

		const postgresClient = postgres(databaseUrl)
		this.dbClient = drizzle(postgresClient)
	}

	async get() {
		return {
			client: this.dbClient,
			schema,
		}
	}
}

// MARK: Playwright Test

/**
 * Database provider for playwright tests
 * Connects to a new database for each playwright test as specified by the X-Playwright-DB header
 */
class PlaywrightDatabaseProvider extends DatabaseProvider {
	private dbClients = new Map<string, PostgresJsDatabase>()

	async get(event: RequestEvent) {
		// Retrieve the database URL from the headers for the playwright test
		const eventDbUrl = event.request.headers.get("X-Playwright-DB")
		if (!eventDbUrl) throw new Error("X-Playwright-DB header is not set")

		const dbClient = this.dbClients.get(eventDbUrl)
		if (dbClient) return { client: dbClient, schema }

		// Initialize a new database client for the playwright test
		const postgresClient = postgres(eventDbUrl)
		const newDbClient = drizzle(postgresClient)

		this.dbClients.set(eventDbUrl, newDbClient)
		return { client: newDbClient, schema }
	}
}
