<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf"

	import { ResourceSeeder } from "$lib/resources.seeder"

	import Toolbar from "./toolbar.svelte"

	const { Story } = defineMeta({
		title: "Routes/Toolbar",
		component: Toolbar,
	})

	const [user] = new ResourceSeeder(123123).user()
</script>

<Story name="With User">
	<Toolbar {user} />
</Story>

<Story name="Without User">
	<Toolbar user={undefined} />
</Story>
