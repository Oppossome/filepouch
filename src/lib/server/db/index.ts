import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "$env/dynamic/private"

// Ensure that the DATABASE_URL environment variable is set.
if (!env.DATABASE_URL) throw new Error("DATABASE_URL is not set")

// This is the database client that will be used to query the database.

const dbClient = postgres(env.DATABASE_URL)

export const client = drizzle(dbClient)
export * as table from "./schema"
