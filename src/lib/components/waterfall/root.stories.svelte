<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf"

	import * as Waterfall from "./index"

	const { Story } = defineMeta({
		title: "Waterfall/Root",
		component: Waterfall.Root,
	})

	const items = Array.from({ length: 10 }, (_, idx) => {
		const width = (idx + 1) * 100
		return [width, 1100 - width]
	})
</script>

<Story name="Default">
	<Waterfall.Root {items} getAspectRatio={([width, height]) => width / height}>
		{#snippet children([width, height])}
			<img class="w-full" src="https://picsum.photos/{width}/{height}" alt="" />
		{/snippet}
	</Waterfall.Root>
</Story>
