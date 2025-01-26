import { Faker, en, base } from "@faker-js/faker"
import { z } from "zod"

import * as schemas from "./resources"

type SeederFn<Output> = (
	count?: number,
	modCallback?: (faker: Faker, idx: number) => Partial<Output>,
) => Output[]

export class ResourceSeeder {
	#faker: Faker

	constructor(seed?: Faker | number) {
		this.#faker = seed instanceof Faker ? seed : new Faker({ locale: [en, base], seed })
	}

	#defineSeeder<Schema extends z.AnyZodObject>(
		_schema: Schema,
		baseCallback: (faker: Faker) => z.infer<Schema>,
	): SeederFn<z.infer<Schema>> {
		return (count, modCallback) => {
			return Array.from({ length: count ?? 1 }, (_, idx) => ({
				...baseCallback(this.#faker),
				...modCallback?.(this.#faker, idx),
			}))
		}
	}

	baseResource = this.#defineSeeder(schemas.baseResource, (faker) => {
		const createdAt = faker.date.past()

		return {
			id: faker.string.uuid(),
			createdAt: createdAt,
			updatedAt: faker.datatype.boolean()
				? faker.date.between({ from: createdAt, to: new Date() })
				: null,
		}
	})

	user = this.#defineSeeder(schemas.user, (faker) => ({
		...this.baseResource()[0],
		username: faker.internet.username(),
	}))

	upload = this.#defineSeeder(schemas.upload, (faker) => {
		const imgHeight = faker.number.int({ min: 300, max: 1200 })

		return {
			...this.baseResource()[0],
			fileName: `${faker.system.fileName({ extensionCount: 0 })}.png`,
			filePath: `https://picsum.photos/300/${imgHeight}`,
			fileSize: faker.number.int({ min: 1, max: 100 }) * 1000,
			fileType: "image/png",
			fileAspectRatio: 300 / imgHeight,
			userId: faker.string.uuid(),
		}
	})
}
