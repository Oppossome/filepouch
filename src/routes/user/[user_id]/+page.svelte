<script lang="ts">
	import type { PageData } from "./$types"

	interface Props {
		data: PageData
	}

	let { data }: Props = $props()
</script>

{data.user.username}
{#await data.posts then posts}
	{#each posts as post}
		<a href="/upload/{post.id}">{post.fileName}</a>
		<p>{post.fileSize}</p>
		<img src="/upload/{post.id}" alt={post.fileName} />
	{/each}
{/await}
