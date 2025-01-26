<script lang="ts">
	import { getUploads } from "$lib/client"
	import * as User from "$lib/components/atoms/user"
	import * as Waterfall from "$lib/components/atoms/waterfall"
	import * as Upload from "$lib/components/atoms/upload"

	import type { PageData } from "./$types"

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()

	let userPosts = getUploads({ user_id: data.user.id })
</script>

<div class="mx-auto flex justify-between p-8 sm:w-2/3">
	<div class="flex items-center gap-3 pb-4">
		<User.Avatar user={data.user} class="size-16" />

		<div class="flex flex-col gap-1">
			<span class="text-xl">
				{data.user.username}
			</span>
			<span class="text-sm text-muted-foreground">
				Joined {data.user.createdAt.getFullYear()}
			</span>
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
			<Upload.Root href="/uploads/{item.id}" upload={item} />
		{/snippet}
	</Waterfall.Root>
{:else if $userPosts.isError}
	<!--  -->
{/if}
