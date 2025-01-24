<script module lang="ts">
	import { defineMeta, type Args } from "@storybook/addon-svelte-csf"

	import { ResourceSeeder } from "$lib/resources.seeder"

	import * as Upload from "./index"

	const { Story } = defineMeta({
		title: "Atoms/Upload/Root",
		component: Upload.Root,
	})

	const uploads = new ResourceSeeder(123123).upload(3, (faker) => ({
		fileName: `${faker.system.fileName({ extensionCount: 0 })}.txt`,
		fileType: "text/plain",
	}))
</script>

{#snippet template(args: Args<typeof Story>)}
	<div class="w-64">
		<Upload.Root upload={uploads[0]} {...args} />
	</div>
{/snippet}

<Story name="Default" children={template} args={{ upload: uploads[1] }} />

<Story
	name="With Href"
	children={template}
	args={{ upload: uploads[2], href: "https://example.com" }}
/>
