import { fail, redirect } from "@sveltejs/kit"

import type { Actions } from "./$types"

export const actions: Actions = {
	upload: async (event) => {
		// Ensure the user is authenticated
		if (!event.locals.user) {
			return fail(401, {
				message: "Unauthorized",
			})
		}

		// Retrieve the uploaded file
		const formData = await event.request.formData()
		const uploadedFile = formData.get("file")
		if (!(uploadedFile instanceof File)) {
			return fail(400, {
				message: "Invalid file",
			})
		}

		// Upload the file
		const server = event.locals.server
		const filePath = await server.file.upload(uploadedFile)
		await server.db.client.insert(server.db.schema.upload).values({
			fileName: uploadedFile.name,
			filePath: filePath,
			fileSize: uploadedFile.size,
			fileType: uploadedFile.type,
			userId: event.locals.user.id,
		})

		redirect(302, `/users/${event.locals.user.id}`)
	},
}
