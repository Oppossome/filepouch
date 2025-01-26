import { Faker, en, base } from "@faker-js/faker"
import type { PgTableWithColumns } from "drizzle-orm/pg-core"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"

import { ResourceSeeder } from "$lib/resources.seeder"

import * as schema from "./database.schema"

type SeederFn<Output> = (
	count?: number,
	modCallback?: (faker: Faker, idx: number) => Promise<Partial<Output>> | Partial<Output>,
) => Promise<Output[]>

export class DatabaseSeeder {
	#client: PostgresJsDatabase
	#faker: Faker
	#resourceSeeder: ResourceSeeder

	constructor(client: PostgresJsDatabase, seed?: Faker | number) {
		this.#client = client
		this.#faker = seed instanceof Faker ? seed : new Faker({ locale: [en, base], seed })
		this.#resourceSeeder = new ResourceSeeder(this.#faker)
	}

	// MARK: #defineSeeder
	// Define a seeder function for a given table
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	#defineSeeder<Table extends PgTableWithColumns<any>>(
		table: Table,
		baseCallback: (faker: Faker) => Promise<Table["$inferInsert"]> | Table["$inferInsert"],
	): SeederFn<Table["$inferInsert"]> {
		return async (count, modCallback) => {
			const valuePromises = Array.from({ length: count ?? 1 }, async (_, idx) => ({
				...(await baseCallback(this.#faker)),
				...(await modCallback?.(this.#faker, idx)),
			}))

			const values = await Promise.all(valuePromises)
			return this.#client.insert(table).values(values).returning()
		}
	}

	user = this.#defineSeeder(schema.user, () => ({
		...this.#resourceSeeder.user()[0],
		// The hashed value for the password "password"
		passwordHash:
			"$argon2id$v=19$m=19456,t=2,p=1$mq0ZVWmLBmfY/4VhUcSaZA$44Jz7zqbcMkdsx374z9v9HWmLQudfsz4/nZYJ5mxoeg",
	}))

	upload = this.#defineSeeder(schema.upload, () => {
		const [baseUpload] = this.#resourceSeeder.upload()

		return {
			...baseUpload,
			filePath: `https://picsum.photos/300/${300 / baseUpload.fileAspectRatio}`,
		}
	})
}
