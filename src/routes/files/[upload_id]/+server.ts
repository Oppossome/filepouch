import { error, redirect } from "@sveltejs/kit"
import { type RequestHandler } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

/**
 * Retrieves the file associated with the given upload ID.
 */
export const GET: RequestHandler = async ({ locals, params }) => {
	const { db, file } = locals.server

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

	const blobOrUrl = await file.download(dbResult.filePath)
	if (typeof blobOrUrl === "string") redirect(308, blobOrUrl)

	const fileName = params.file_name ?? dbResult.fileName
	return new Response(blobOrUrl, {
		headers: {
			"Content-Type": dbResult.fileType,
			"Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
		},
	})
}
