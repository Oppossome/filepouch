<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf"

	import * as Logo from "./index"

	const { Story } = defineMeta({
		title: "Atoms/Logo/Root",
		component: Logo.Root,
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<Logo.Root {...args} />
	{/snippet}
</Story>
