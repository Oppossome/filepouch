<script lang="ts">
	import * as Upload from "$lib/components/atoms/upload"
	import * as User from "$lib/components/atoms/user"

	import type { PageData } from "./$types"

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()
</script>

<div class="mx-auto flex max-w-[50rem] flex-col p-8">
	<div class="flex justify-between">
		<div class="flex items-center gap-2 pb-4">
			<a href="/users/{data.upload.user.id}">
				<User.Avatar user={data.upload.user} />
			</a>
			<div class="flex flex-col">
				<a class="text-sm" href="/users/{data.upload.user.id}">
					{data.upload.user.username}
				</a>
				<span class="text-xs text-muted-foreground">
					Joined {data.upload.user.createdAt.getFullYear()}
				</span>
			</div>
		</div>
	</div>

	<div class="bg-foreground/5 [&_img]:max-h-[75vh] [&_img]:object-contain">
		<Upload.Content upload={data.upload} />
	</div>
</div>

<!-- <style lang="postcss">
	.c_page {
		display: flex;
		flex-direction: column;

		max-width: 50rem;
		margin: 0 auto;
		padding: 2rem;

		& .topbar {
			display: flex;
			justify-content: space-between;

			& .user {
				display: flex;
				gap: theme("gap.2");
				align-items: center;
				padding-bottom: theme("padding.4");

				& .details {
					display: flex;
					flex-direction: column;

					& .username {
						font-size: theme("fontSize.sm");
					}

					& .date {
						font-size: theme("fontSize.xs");
					}
				}
			}
		}

		& .content {
			max-height: 75vh;
			background-color: theme("backgroundColor.secondary.foreground/.05");

			& :global(img) {
				max-height: inherit;
				object-fit: contain;
			}
		}
	}
</style> -->
