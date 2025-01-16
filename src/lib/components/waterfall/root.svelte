<script lang="ts" generics="I">
	import type { Snippet } from "svelte"

	// eslint-disable-next-line no-undef
	type Item = I

	interface Props {
		class?: string
		items: Item[]
		getAspectRatio: (item: Item) => number
		children: Snippet<[item: Item]>
	}

	let { class: classes = "", items, getAspectRatio, children }: Props = $props()

	let elementWidth: number = $state(0)
	let columns = $derived.by(() => {
		const columnCount = Math.max(1, Math.floor(elementWidth / 300))
		const columns = Array.from({ length: columnCount }, () => ({ items: Array<Item>(), height: 0 }))

		for (const item of items) {
			const smallestColumn = columns.reduce(
				(smallest, curr) => (smallest.height > curr.height ? curr : smallest),
				columns[0],
			)

			smallestColumn.height += 300 / getAspectRatio(item)
			smallestColumn.items.push(item)
		}

		return columns
	})
</script>

<div class="c_waterfall flex {classes}" bind:clientWidth={elementWidth}>
	{#each columns as column}
		<div class="w-full sm:w-[300px]">
			{#each column.items as item}
				{@render children(item)}
			{/each}
		</div>
	{/each}
</div>
