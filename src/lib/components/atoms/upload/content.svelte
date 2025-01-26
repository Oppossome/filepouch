<script lang="ts">
	import { File } from "lucide-svelte"
	import { fade } from "svelte/transition"

	import type { Upload } from "$lib/resources"
	import { loadImage } from "$lib/utils"

	interface Props {
		upload: Upload
	}

	let { upload }: Props = $props()
</script>

{#if upload.fileType.startsWith("image/")}
	{#await loadImage(`/files/${upload.id}`)}
		<div class="loading-overlay" out:fade={{ duration: 250 }}></div>
	{:then image}
		<img src={image.src} alt={upload.fileName} />
	{/await}
{:else}
	<File size="4rem" />
	<span class="text-sm">
		{upload.fileName}
	</span>
{/if}

<style lang="postcss">
	img {
		width: 100%;
	}

	.loading-overlay {
		position: absolute;
		z-index: 2;
		inset: 0;
		background-color: color-mix(
			in srgb,
			theme("colors.secondary.foreground") 5%,
			theme("colors.background")
		);
	}
</style>
