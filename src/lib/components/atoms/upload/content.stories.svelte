<script module lang="ts">
	import { defineMeta } from "@storybook/addon-svelte-csf"

	import { ResourceSeeder } from "$lib/resources.seeder"

	import * as Upload from "./index"

	const { Story } = defineMeta({
		title: "Atoms/Upload/Content",
		component: Upload.Content,
	})

	const uploads = new ResourceSeeder(123123).upload(3, (faker) => ({
		fileName: `${faker.system.fileName({ extensionCount: 0 })}.txt`,
		fileType: "text/plain",
	}))
</script>

<Story name="Default" args={{ upload: uploads[1] }}>
	{#snippet children(args)}
		<Upload.Content upload={uploads[0]} {...args} />
	{/snippet}
</Story>
