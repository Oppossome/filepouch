<script lang="ts">
	import { File } from "lucide-svelte"

	import type { Upload } from "$lib/resources"

	interface Props {
		href: string
		upload: Upload
	}

	let { href, upload }: Props = $props()
</script>

<a {href} class="group bg-secondary-foreground/5 hover:bg-secondary-foreground/15">
	{#if upload.fileType.startsWith("image/")}
		<img
			class="w-full"
			alt={upload.fileName}
			src="/uploads/{upload.id}"
			style:aspect-ratio={upload.fileAspectRatio}
		/>
	{:else}
		<div class="grid aspect-square place-items-center">
			<div
				class="flex flex-col items-center gap-4 text-secondary-foreground opacity-85 group-hover:opacity-100"
			>
				<File size="4rem" />
				<span class="text-sm">
					{upload.fileName}
				</span>
			</div>
		</div>
	{/if}
</a>
