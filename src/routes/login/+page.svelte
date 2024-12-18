<script lang="ts">
	import * as Card from "$lib/components/ui/card"

	import Form from "./form.svelte"
</script>

<div class="flex h-full items-center justify-center">
	<Card.Root class="mx-auto w-96">
		<Card.Header>
			<Card.Title class="text-2xl">Login</Card.Title>
		</Card.Header>
		<Card.Content>
			<Form />
			<div class="mt-4 text-center text-sm">
				Don&apos;t have an account?
				<a href="/register" class="underline"> Sign up </a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
