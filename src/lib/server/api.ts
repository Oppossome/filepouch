import { resolve } from "path"
import { writeFile, rm } from "fs/promises"

import { defineAPI } from "sveltekit-openapi"

export const api = defineAPI({
	info: {
		title: "Filepouch",
		version: "0.0.1",
	},
})

export async function generateAPIClient() {
	// Only run this function in development mode
	if (!import.meta.env.DEV) return

	// Generate the OpenAPI specification for openapi-ts
	const schemaOutput = resolve("oapi-schema.json")
	await writeFile(schemaOutput, JSON.stringify(await api.generateSpec(), null, 2))

	// Dynamically import the client generator so it's only a development dependency
	const { createClient } = await import("@hey-api/openapi-ts")
	await createClient({
		client: "@hey-api/client-fetch",
		input: schemaOutput,
		output: resolve("src/lib/client"),
	})

	// Cleanup after ourselves
	await rm(schemaOutput)
}
