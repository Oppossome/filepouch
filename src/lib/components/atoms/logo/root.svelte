<script lang="ts">
	interface Props {
		class?: string
		href?: string
	}

	let { class: classes = "", href }: Props = $props()
</script>

<svelte:element this={href ? "a" : "div"} class="c_logo {classes}" {href}>
	File<span>pouch</span>
</svelte:element>

<style lang="postcss">
	.c_logo {
		margin: 0.35em 0em;
		font-size: 1.5rem;
		font-weight: 300;

		& span {
			padding-right: 0.5em;

			font-style: italic;
			color: transparent;

			background: conic-gradient(at 125% 50%, #b78cf7, #ff7c94, #ffcf0d, #ff7c94, #b78cf7);
			-webkit-background-clip: text;
			background-clip: text;
		}
	}
</style>
