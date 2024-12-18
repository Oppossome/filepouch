import { eq } from "drizzle-orm"
import { error } from "@sveltejs/kit"

import * as db from "$lib/server/db"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const dbResponse = await db.client
		.select()
		.from(db.table.user)
		.where(eq(db.table.user.id, event.params.userid))
		.limit(1)

	const user = dbResponse.at(0)
	if (!user) return error(404, "User not found")

	return {
		user: {
			id: user.id,
			username: user.username,
		},
	}
}
