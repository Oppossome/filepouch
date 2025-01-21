<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf"

	import * as Waterfall from "./index"

	const { Story } = defineMeta({
		title: "UI/Waterfall/Item",
		component: Waterfall.Item,
	})
</script>

<Story name="Default">
	{#snippet children(args)}
		<Waterfall.Item {...args} />
	{/snippet}
</Story>
