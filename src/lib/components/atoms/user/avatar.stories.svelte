<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf"

	import { ResourceSeeder } from "$lib/resources.seeder"

	import * as User from "./index"

	const { Story } = defineMeta({
		title: "Atoms/User/Avatar",
		component: User.Avatar,
	})

	const [user] = new ResourceSeeder(123123).user()
</script>

<Story name="Default">
	{#snippet children(args)}
		<User.Avatar {user} {...args} />
	{/snippet}
</Story>
