import { eq } from "drizzle-orm"
import { error } from "@sveltejs/kit"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const server = event.locals.server
	const dbResponse = await server.db.client
		.select()
		.from(server.db.tables.user)
		.where(eq(server.db.tables.user.id, event.params.userid))
		.limit(1)

	const user = dbResponse.at(0)
	if (!user) return error(404, "User not found")

	return {
		user: {
			id: user.id,
			username: user.username,
			role: user.role,
		},
	}
}
