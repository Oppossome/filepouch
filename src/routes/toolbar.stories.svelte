<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf"

	import Toolbar from "./toolbar.svelte"

	const { Story } = defineMeta({
		title: "Routes/Toolbar",
		component: Toolbar,
	})
</script>

<Story name="With User">
	<Toolbar
		user={{
			id: crypto.randomUUID(),
			createdAt: new Date(),
			updatedAt: null,
			username: "Test",
		}}
	/>
</Story>

<Story name="Without User">
	<Toolbar user={undefined} />
</Story>
