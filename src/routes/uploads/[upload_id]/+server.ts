import { error } from "@sveltejs/kit"
import { type RequestHandler } from "@sveltejs/kit"
import { eq } from "drizzle-orm"

export const GET: RequestHandler = async (event) => {
	const server = event.locals.server

	if (!event.params.upload_id) {
		error(400, "upload_id is a required parameter")
	}

	const [upload] = await server.db.client
		.select()
		.from(server.db.schema.upload)
		.where(eq(server.db.schema.upload.id, event.params.upload_id))
		.limit(1)

	if (!upload) {
		error(404, "Upload not found")
	}

	const file = await server.upload.download(upload.filePath)
	const fileName = event.params.file_name ?? upload.fileName

	return new Response(file, {
		headers: {
			"Content-Type": upload.fileType,
			"Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`,
		},
	})
}
