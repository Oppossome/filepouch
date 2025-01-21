<script lang="ts">
	import { goto } from "$app/navigation"

	import * as Avatar from "$lib/components/ui/avatar"
	import * as Logo from "$lib/components/ui/logo"
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu"
	import type { User } from "$lib/resources"

	import { UploadContext } from "./upload.svelte.ts"

	interface Props {
		user: User | undefined
	}

	let { user }: Props = $props()

	const uploadContext = UploadContext.get()
</script>

<div class="c_toolbar">
	<header class="toolbar">
		<Logo.Root href="/" />

		{#if user}
			<div class="flex items-center gap-6">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="rounded-full">
						<Avatar.Root class="size-8 text-sm">
							<Avatar.Fallback class="uppercase">
								{user.username[0]}
							</Avatar.Fallback>
						</Avatar.Root>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item onclick={() => goto(`/users/${user.id}`)}>Profile</DropdownMenu.Item>
						<!-- <DropdownMenu.Item onclick={() => goto("/users/settings")}>Settings</DropdownMenu.Item> -->
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

			display: flex;
			align-items: center;
			justify-content: space-between;

			height: inherit;
			padding: 0.25rem 1rem;
			border-bottom: 1px solid hsl(var(--border));

			background: hsl(var(--background) / 75%);
			backdrop-filter: blur(8px);
		}
	}
</style>
