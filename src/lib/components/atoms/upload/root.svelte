<script lang="ts">
	import type { Snippet } from "svelte"

	import * as Resources from "$lib/resources"

	import * as Upload from "./index"

	interface Props {
		href?: string
		upload: Resources.Upload
		children?: Snippet<[]>
	}

	let { href, upload, children }: Props = $props()
</script>

<div class="c_upload">
	<svelte:element
		this={href ? "a" : "div"}
		class="preview"
		{href}
		style:aspect-ratio={upload.fileAspectRatio}
	>
		<Upload.Content {upload} />
	</svelte:element>
	{#if children}
		{@render children()}
	{/if}
</div>

<style lang="postcss">
	.c_upload {
		position: relative;
		display: flex;
		flex-direction: column;
		background-color: theme("backgroundColor.secondary.foreground/.05");

		& .preview {
			display: flex;
			flex-direction: column;
			gap: theme("gap.2");
			align-items: center;
			justify-content: center;
		}
	}
</style>
