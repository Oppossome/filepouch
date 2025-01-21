<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf"
	import { action } from "@storybook/addon-actions"

	import * as Waterfall from "./index"

	const { Story } = defineMeta({
		title: "UI/Waterfall/Root",
		component: Waterfall.Root,
	})

	const items = Array.from({ length: 10 }, (_, idx) => {
		const width = (idx + 1) * 100
		return [width, 1100 - width]
	})
		.flatMap((item) => [item, item, item])
		.sort(() => 0.5 - Math.random())
</script>

<Story name="Default">
	<Waterfall.Root
		{items}
		getAspectRatio={([width, height]) => width / height}
		onReachedEnd={action("onReachedEnd")}
	>
		{#snippet children([width, height])}
			<img
				class="w-full"
				src="https://picsum.photos/{width}/{height}"
				alt=""
				style:aspect-ratio={width / height}
			/>
		{/snippet}
	</Waterfall.Root>
</Story>
