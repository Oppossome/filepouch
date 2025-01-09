import { error } from "@sveltejs/kit"
import { type RequestHandler } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

export const GET: RequestHandler = async ({ locals, params }) => {
	const { db, upload } = locals.server

	if (!params.upload_id) {
		error(400, "upload_id is a required parameter")
	}

	const [dbResult] = await db.client
		.select()
		.from(db.schema.upload)
		.where(eq(db.schema.upload.id, params.upload_id))
		.limit(1)

	if (!dbResult) {
		error(404, "Upload not found")
	}

	const file = await upload.download(dbResult.filePath)
	const fileName = params.file_name ?? dbResult.fileName

	return new Response(file, {
		headers: {
			"Content-Type": dbResult.fileType,
			"Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
		},
	})
}
