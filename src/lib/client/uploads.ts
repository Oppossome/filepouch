import { createInfiniteQuery, createMutation, createQuery } from "@tanstack/svelte-query"

import * as api from "./generated"

export function getUploads(query?: Omit<api.GetUploadsData["query"], "page_token">) {
	return createInfiniteQuery({
		queryKey: ["uploads", query],
		initialPageParam: undefined as string | undefined,
		queryFn: ({ pageParam }) => api.getUploads({ query: { ...query, page_token: pageParam } }),
		getNextPageParam: (lastPage) => lastPage.data?.next_page_token,
	})
}

export function getUpload(upload_id: string) {
	return createQuery({
		queryKey: ["upload", { upload_id }],
		queryFn: () => api.getUpload({ path: { upload_id } }),
	})
}

/**
 * TODO: Temporary measure
 */
export async function uploadFiles(files: File[]): Promise<api.UploadFilesResponse> {
	const formData = new FormData()
	for (const file of files) formData.append("file", file)

	const response = await fetch("/api/uploads:upload", { method: "POST", body: formData })
	return await response.json()
}
