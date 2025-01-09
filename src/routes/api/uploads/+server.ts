import { z } from "zod"
import { desc, eq, lt, and } from "drizzle-orm"

import { upload, user } from "$lib/resources"
import { api } from "$lib/server/api"

export const GET = api.defineEndpoint(
	{
		operationId: "getUploads",
		description: "Returns uploads and the user who uploaded them.",
		parameters: {
			query: z.object({
				user_id: user.shape.id.optional(),
				page_size: z.coerce.number().int().min(1).max(100).default(10),
				page_token: z.coerce.date().optional(),
			}),
		},
		responses: {
			200: {
				description: "OK",
				content: z.object({
					uploads: z.array(upload.extend({ user })),
					next_page_token: z.date().optional(),
				}),
			},
		},
	},
	async ({ locals, params, json }) => {
		const { db } = locals.server

		const dbResults = await db.client
			.select()
			.from(db.schema.upload)
			.innerJoin(db.schema.user, eq(db.schema.upload.userId, db.schema.user.id))
			.where(
				and(
					params.query.user_id ? eq(db.schema.upload.userId, params.query.user_id) : undefined,
					params.query.page_token
						? lt(db.schema.upload.createdAt, params.query.page_token)
						: undefined,
				),
			)
			.orderBy(desc(db.schema.upload.createdAt))
			.limit(params.query.page_size)

		return json(200, {
			next_page_token: dbResults.at(-1)?.upload.createdAt,
			uploads: dbResults.map((dbResult) => ({
				...dbResult.upload,
				user: dbResult.user,
			})),
		})
	},
)
