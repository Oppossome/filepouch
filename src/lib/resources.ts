import { z } from "zod"

export const baseResource = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date().nullable(),
})

export const user = baseResource.extend({
	username: z.string(),
})

export const upload = baseResource.extend({
	fileName: z.string(),
	filePath: z.string(),
	fileSize: z.number().int(),
	fileType: z.string(),
	userId: z.string(),
})
