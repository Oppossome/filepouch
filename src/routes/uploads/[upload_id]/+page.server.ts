import { eq, getTableColumns } from "drizzle-orm"
import { error } from "@sveltejs/kit"

import { upload, user } from "$lib/resources"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const { db } = event.locals.server

	const [dbResult] = await db.client
		.select({ ...getTableColumns(db.schema.upload), user: db.schema.user })
		.from(db.schema.upload)
		.innerJoin(db.schema.user, eq(db.schema.upload.userId, db.schema.user.id))
		.where(eq(db.schema.upload.id, event.params.upload_id))
		.limit(1)

	if (!dbResult) {
		error(404, "User not found")
	}

	return {
		upload: upload.extend({ user }).parse(dbResult),
	}
}
