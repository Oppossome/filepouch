<script lang="ts">
	import { goto } from "$app/navigation"

	import * as User from "$lib/components/atoms/user"
	import * as Logo from "$lib/components/atoms/logo"
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu"
	import type * as resources from "$lib/resources"

	import { UploadContext } from "./upload.svelte.ts"

	interface Props {
		user: resources.User | undefined
	}

	let { user }: Props = $props()

	const uploadContext = UploadContext.get()
</script>

<div class="c_toolbar">
	<header class="toolbar">
		<div class="content">
			<Logo.Root href="/" />

			{#if user}
				<div class="flex items-center gap-6">
					<DropdownMenu.Root>
						<DropdownMenu.Trigger class="rounded-full">
							<User.Avatar {user} class="size-8 text-sm" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item onclick={() => goto(`/users/${user.id}`)}
								>Profile</DropdownMenu.Item
							>
							<DropdownMenu.Item onclick={() => (uploadContext.open = true)}>
								Upload
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onclick={() => goto("/logout")}>Log Out</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			{:else}
				<a href="/login">Sign In</a>
			{/if}
		</div>
	</header>
</div>

<style lang="postcss">
	.c_toolbar {
		height: 3rem;

		& .toolbar {
			position: fixed;
			z-index: 10;
			top: 0;
			right: 0;
			left: 0;

			height: inherit;
			border-bottom: 1px solid hsl(var(--border));

			background: hsl(var(--background) / 75%);
			backdrop-filter: blur(8px);

			& .content {
				display: flex;
				align-items: center;
				justify-content: space-between;

				max-width: 120rem;
				height: inherit;
				margin: 0 auto;
				padding: 0.25rem 1rem;
			}
		}
	}
</style>
