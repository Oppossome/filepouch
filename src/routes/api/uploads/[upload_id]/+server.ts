import { z } from "zod"
import { eq, getTableColumns } from "drizzle-orm"

import { upload, user } from "$lib/resources"
import { api } from "$lib/server/api"

export const GET = api.defineEndpoint(
	{
		operationId: "getUpload",
		description: "Returns an upload's details and the user who uploaded it by its ID.",
		parameters: {
			path: z.object({
				upload_id: z.string(),
			}),
		},
		responses: {
			200: {
				description: "OK",
				content: z.object({
					upload: upload.extend({
						user: user,
					}),
				}),
			},
			404: {
				description: "Not Found",
				content: undefined,
			},
		},
	},
	async ({ locals, params, json }) => {
		const { db } = locals.server

		const [dbResult] = await db.client
			.select({ ...getTableColumns(db.schema.upload), user: db.schema.user })
			.from(db.schema.upload)
			.where(eq(db.schema.upload.id, params.path.upload_id))
			.innerJoin(db.schema.user, eq(db.schema.upload.userId, db.schema.user.id))
			.limit(1)

		if (!dbResult) return json(404)
		return json(200, { upload: dbResult })
	},
)
