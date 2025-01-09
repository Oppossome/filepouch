import { defineAPI } from "sveltekit-openapi"

export const api = defineAPI({
	info: {
		title: "Filepouch",
		version: "0.0.1",
	},
})
