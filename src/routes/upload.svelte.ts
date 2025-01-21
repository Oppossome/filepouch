import { untrack } from "svelte"
import { createMutation, getQueryClientContext, type QueryClient } from "@tanstack/svelte-query"
import toast from "svelte-french-toast"

import { goto } from "$app/navigation"

import { defineContextPair, wait } from "$lib/utils"
import { uploadFiles } from "$lib/client"

export class UploadContext {
	static #contextPair = defineContextPair<UploadContext>("uploadContext")
	static get = this.#contextPair.get

	#queryClient: QueryClient

	open: boolean = $state(false)
	files: File[] = $state([])
	dragOver: boolean = $state(false)

	constructor() {
		this.#queryClient = getQueryClientContext()
		UploadContext.#contextPair.set(this)

		// Reset state on close
		$effect(() => {
			if (!this.open) {
				untrack(() => {
					this.files = []
					this.dragOver = false
				})
			}
		})
	}

	async addFiles(uploadFiles?: FileList | null) {
		for (const file of uploadFiles ?? []) {
			this.files.unshift(file)
			await wait(50)
		}
	}

	uploadMutation = createMutation({
		mutationFn: () => uploadFiles(this.files),
		onSuccess: (data) => {
			const user_id = data.uploads[0].user.id
			this.#queryClient.invalidateQueries({ queryKey: ["uploads", { user_id }] })
			goto(`/users/${user_id}`)

			toast.success("Successfully uploaded files")
			this.open = false
		},
	})
}
