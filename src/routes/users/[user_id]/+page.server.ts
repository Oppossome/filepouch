import { eq } from "drizzle-orm"
import { error } from "@sveltejs/kit"

import { user } from "$lib/resources"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const { db } = event.locals.server

	const [dbResult] = await db.client
		.select()
		.from(db.schema.user)
		.where(eq(db.schema.user.id, event.params.user_id))
		.limit(1)

	if (!dbResult) {
		error(404, "User not found")
	}

	return {
		user: user.parse(dbResult),
	}
}
