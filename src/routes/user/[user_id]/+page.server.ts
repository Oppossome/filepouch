import { eq, desc } from "drizzle-orm"
import { error } from "@sveltejs/kit"

import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async (event) => {
	const db = event.locals.server.db
	const [user] = await db.client
		.select({
			id: db.schema.user.id,
			username: db.schema.user.username,
			createdAt: db.schema.user.createdAt,
		})
		.from(db.schema.user)
		.where(eq(db.schema.user.id, event.params.user_id))
		.limit(1)

	if (!user) {
		error(404, "User not found")
	}

	// Retrieve the user's posts
	const userPosts = db.client
		.select({
			id: db.schema.upload.id,
			fileName: db.schema.upload.fileName,
			fileSize: db.schema.upload.fileSize,
			createdAt: db.schema.upload.createdAt,
		})
		.from(db.schema.upload)
		.where(eq(db.schema.upload.userId, user.id))
		.orderBy(desc(db.schema.upload.createdAt))

	return {
		user: {
			id: user.id,
			username: user.username,
			createdAt: user.createdAt,
		},
		posts: userPosts,
	}
}
