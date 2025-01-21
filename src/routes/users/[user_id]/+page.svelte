<script lang="ts">
	import { getUploads } from "$lib/client"
	import * as Avatar from "$lib/components/ui/avatar"
	import * as Waterfall from "$lib/components/ui/waterfall"

	import type { PageData } from "./$types"

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	let userPosts = getUploads({ user_id: data.user.id })
</script>

<div class="flex flex-col items-center p-4">
	<div class="flex w-full items-center gap-2 md:w-[48rem]">
		<Avatar.Root class="size-14">
			<Avatar.Fallback class="uppercase">
				{data.user.username[0]}
			</Avatar.Fallback>
		</Avatar.Root>
		<div class="flex flex-col">
			<h1>{data.user.username}</h1>
			<p class="text-sm text-muted-foreground">Joined {data.user.createdAt.getFullYear()}</p>
		</div>
	</div>
</div>

{#if $userPosts.data?.pages}
	<Waterfall.Root
		items={$userPosts.data.pages.flatMap((page) => page.data?.uploads ?? [])}
		getAspectRatio={(item) => item.fileAspectRatio}
		onReachedEnd={$userPosts.hasNextPage ? $userPosts.fetchNextPage : undefined}
	>
		{#snippet children(item)}
			<Waterfall.Item href="/uploads/{item.id}" upload={item} />
		{/snippet}
	</Waterfall.Root>
{:else if $userPosts.isError}
	<!--  -->
{/if}
