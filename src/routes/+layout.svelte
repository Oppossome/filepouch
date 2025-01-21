<script lang="ts">
	import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query"
	import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools"
	import type { Snippet } from "svelte"
	import { Toaster } from "svelte-french-toast"

	import Toolbar from "./toolbar.svelte"
	import Upload from "./upload.svelte"
	import type { LayoutData } from "./$types"
	import "../app.css"

	interface Props {
		data: LayoutData
		children: Snippet<[]>
	}

	let { data, children }: Props = $props()

	const queryClient = new QueryClient()
</script>

<QueryClientProvider client={queryClient}>
	<!-- Upload wraps the content of the page in order to provide lower context -->
	<Upload>
		<Toolbar user={data.local_user} />
		{@render children()}
		<SvelteQueryDevtools />
		<Toaster />
	</Upload>
</QueryClientProvider>
