<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar"

	import type { PageData } from "./$types"

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()
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

<!-- <div class="w-[48rem] border border-red-400"></div> -->

<!-- <style lang="postcss">
	.c_user {
		& .header {
			display: flex;
			flex-direction: column;

			& .user {
				display: flex;
				align-items: center;

				width: 48rem;
				border: 1px solid red;

				h1 {
					@apply text-sm;
				}
			}
		}
	}
</style> -->
