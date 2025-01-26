import sharp from "sharp"
import { z } from "zod"

import { user, upload } from "$lib/resources"
import type { NewUpload } from "$lib/server/database.schema"
import { api } from "$lib/server"

import type { RequestHandler } from "./$types"

async function getAspectRatio(blob: Blob): Promise<number> {
	try {
		const buffer = await blob.arrayBuffer()

		// Because the width and height don't take the exif orientation into account,
		// rotate the image accordingly
		const metadata = await sharp(buffer).rotate().metadata()
		return metadata.width! / metadata.height!
	} catch {
		return 1
	}
}

export const POST: RequestHandler = api.defineEndpoint(
	{
		operationId: "uploadFiles",
		responses: {
			200: {
				description: "OK",
				content: z.object({
					uploads: z.array(
						upload.extend({
							user: user,
						}),
					),
				}),
			},
			400: {
				description: "Invalid Files",
				content: undefined,
			},
			401: {
				description: "Unauthorized",
				content: undefined,
			},
		},
	},
	async ({ request, locals, json }) => {
		const { server, user } = locals
		if (!user) return json(401)

		// Upload every provided file and construct the database entries.
		const formData = await request.formData()
		const filePromises: Promise<NewUpload>[] = formData
			.getAll("file")
			.filter((uploadedFile) => uploadedFile instanceof File)
			.map(async (uploadedFile) => ({
				fileName: uploadedFile.name,
				filePath: await server.file.upload(uploadedFile),
				fileSize: uploadedFile.size,
				fileType: uploadedFile.type,
				fileAspectRatio: await getAspectRatio(uploadedFile),
				userId: user.id,
			}))

		const newUploads: NewUpload[] = (await Promise.allSettled(filePromises))
			.filter((promise) => promise.status === "fulfilled")
			.map((promise) => promise.value)

		if (!newUploads.length) return json(400)

		const uploads = await server.db.client
			.insert(server.db.schema.upload)
			.values(newUploads)
			.returning()

		return json(200, {
			uploads: uploads.map((upload) => ({
				...upload,
				user,
			})),
		})
	},
)
