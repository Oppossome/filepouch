import * as fs from "fs/promises"
import * as path from "path"

import { z } from "zod"

import { randomStr } from "$lib/utils"

// MARK: Abstract

export abstract class FileProvider {
	abstract upload(file: File): Promise<string>
	abstract download(filePath: string): Promise<Blob | string>
	abstract delete(filePath: string): Promise<void>

	static async init() {
		return new LocalFileProvider()
	}
}

// MARK: Local

class LocalFileProvider extends FileProvider {
	constructor() {
		super()

		// Ensure the uploads directory exists
		fs.mkdir("uploads", { recursive: true })
	}

	async upload(file: File) {
		// Generate a unique file ID and path
		const fileId = randomStr(32)
		const filePath = `uploads/${fileId}${path.extname(file.name)}`

		// Save the file to the local filesystem
		const buffer = Buffer.from(await file.arrayBuffer())
		await fs.writeFile(filePath, buffer)

		return filePath
	}

	async download(filePath: string) {
		// Predominately occurs when we have seeded data.
		const urlParse = z.string().url().safeParse(filePath)
		if (urlParse.success) return filePath

		//
		const fileBuffer = await fs.readFile(filePath)
		return new Blob([fileBuffer])
	}

	async delete(filePath: string) {
		await fs.rm(filePath)
	}
}
