<script lang="ts">
	import * as Card from "$lib/components/ui/card"

	import Form from "./form.svelte"
</script>

<div class="flex h-full items-center justify-center">
	<Card.Root class="mx-auto w-96">
		<Card.Header>
			<Card.Title class="text-2xl">Create Account</Card.Title>
		</Card.Header>
		<Card.Content>
			<Form />
			<div class="mt-4 text-center text-sm">
				Already have an account?
				<a href="/login" class="underline"> Sign in </a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
