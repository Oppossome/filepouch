<script lang="ts" generics="I">
	import type { Snippet } from "svelte"

	import { onIntersecting } from "$lib/utils.svelte"

	// eslint-disable-next-line no-undef
	type Item = I

	interface Props {
		class?: string
		items: Item[]
		getAspectRatio: (item: Item) => number
		onReachedEnd?: () => void
		children: Snippet<[item: Item]>
	}

	let { class: classes = "", items, getAspectRatio, onReachedEnd, children }: Props = $props()

	let elementWidth: number = $state(0)
	let columnCount: number = $derived(Math.max(1, Math.floor(elementWidth / 300)))
	let columns = $derived.by(() => {
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

<div class="c_waterfall {classes}" bind:clientWidth={elementWidth}>
	{#each columns as column}
		<div class="column">
			{#each column.items as item}
				{@render children(item)}
			{/each}
			{#if onReachedEnd}
				<div
					class="h-1"
					data-testid="wf-end-observer"
					use:onIntersecting={{ callback: (intersecting) => intersecting && onReachedEnd() }}
				></div>
			{/if}
		</div>
	{/each}
</div>

<style lang="postcss">
	.c_waterfall {
		display: flex;
		gap: theme("gap.2");
		justify-content: center;
		padding: theme("padding.2");

		& .column {
			display: flex;
			flex-direction: column;
			gap: inherit;

			width: 100%;
			max-width: 300px;

			&:only-child {
				max-width: unset;
			}
		}
	}
</style>
