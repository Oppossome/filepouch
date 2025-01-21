import { Faker, en, base } from "@faker-js/faker"
import type { PgTableWithColumns } from "drizzle-orm/pg-core"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"

import * as schema from "./database.schema"

export class DatabaseSeeder {
	#client: PostgresJsDatabase
	#faker: Faker

	constructor(client: PostgresJsDatabase, seed?: number) {
		this.#client = client
		this.#faker = new Faker({ locale: [en, base], seed })
	}

	// MARK: #defineSeeder
	// Define a seeder function for a given table
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	#defineSeeder<Table extends PgTableWithColumns<any>>(
		table: Table,
		callback: (faker: Faker) => Promise<Table["$inferInsert"]>,
	) {
		const getSeedItems = async (
			count: number,
			partialCb?: (faker: Faker, idx: number) => Partial<Table["$inferInsert"]>,
		): Promise<Table["$inferInsert"][]> => {
			return Promise.all(
				Array.from({ length: count }, async (_, idx) => ({
					...(await callback(this.#faker)),
					...(await partialCb?.(this.#faker, idx)),
				})),
			)
		}

		return {
			many: async (...args: Parameters<typeof getSeedItems>) => {
				const seedItems = await getSeedItems(...args)
				const dbItems = await this.#client.insert(table).values(seedItems).returning()

				return dbItems
			},
			one: async (partialCb?: Parameters<typeof getSeedItems>[1]) => {
				const [seedItem] = await getSeedItems(1, partialCb)
				const [dbItem] = await this.#client.insert(table).values(seedItem).returning()

				return dbItem
			},
		}
	}

	// MARK: users
	users = this.#defineSeeder(schema.user, async (f) => ({
		createdAt: f.date.recent(),
		username: f.internet.username().toLowerCase(),
		// The hashed value for the password "password"
		passwordHash:
			"$argon2id$v=19$m=19456,t=2,p=1$mq0ZVWmLBmfY/4VhUcSaZA$44Jz7zqbcMkdsx374z9v9HWmLQudfsz4/nZYJ5mxoeg",
	}))

	// MARK: posts
	posts = this.#defineSeeder(schema.upload, async (f) => {
		const imgHeight = f.number.int({ min: 300, max: 1200 })

		return {
			createdAt: f.date.recent(),
			fileName: `${f.system.fileName({ extensionCount: 0 })}.png`,
			filePath: `https://picsum.photos/300/${imgHeight}`,
			fileSize: f.number.int({ min: 1, max: 100 }) * 1000,
			fileType: "image/png",
			fileAspectRatio: 300 / imgHeight,
			userId: f.string.uuid(),
		}
	})
}
