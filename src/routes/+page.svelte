<script lang="ts">
	import { getUploads } from "$lib/client"
	import * as Waterfall from "$lib/components/atoms/waterfall"
	import * as Upload from "$lib/components/atoms/upload"

	let posts = getUploads({})
</script>

{#if $posts.data?.pages}
	<Waterfall.Root
		items={$posts.data.pages.flatMap((page) => page.data?.uploads ?? [])}
		getAspectRatio={(item) => item.fileAspectRatio}
		onReachedEnd={$posts.hasNextPage ? $posts.fetchNextPage : undefined}
	>
		{#snippet children(item)}
			<Upload.Root href="/uploads/{item.id}" upload={item} />
		{/snippet}
	</Waterfall.Root>
{:else if $posts.isError}
	<!--  -->
{/if}
