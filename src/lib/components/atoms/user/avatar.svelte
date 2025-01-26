<script lang="ts">
	import * as Avatar from "$lib/components/ui/avatar"
	import type { User } from "$lib/resources"

	interface Props {
		href?: string
		class?: string
		user: User
	}

	let { class: classes = "", user }: Props = $props()
</script>

<Avatar.Root class={classes}>
	{#snippet children()}
		<Avatar.Fallback class="uppercase">
			{user.username[0]}
		</Avatar.Fallback>
	{/snippet}
</Avatar.Root>
