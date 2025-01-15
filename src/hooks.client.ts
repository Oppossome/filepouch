import type { ClientInit } from "@sveltejs/kit"

import { client } from "$lib/client"

export const init: ClientInit = () => {
	client.setConfig({
		baseUrl: import.meta.env.VITE_API_URL,
		fetch: (request) => fetch(request, { credentials: "same-origin" }),
	})
}
