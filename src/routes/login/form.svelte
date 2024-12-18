<script module lang="ts">
	import { z } from "zod"

	import * as schemas from "$lib/schemas.ts"

	export const loginSchema = z.object({
		username: schemas.user_name,
		password: schemas.user_password,
	})
</script>

<script lang="ts">
	import { zodClient } from "sveltekit-superforms/adapters"
	import { superForm } from "sveltekit-superforms"

	import * as Form from "$lib/components/ui/form"
	import { Input } from "$lib/components/ui/input"

	const form = superForm(
		{
			username: "",
			password: "",
		},
		{
			validators: zodClient(loginSchema),
		},
	)

	const { form: formData, enhance } = form
</script>

<form method="post" use:enhance>
	<Form.Field {form} name="username">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Username</Form.Label>
				<Input {...props} bind:value={$formData.username} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Field {form} name="password">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Password</Form.Label>
				<Input type="password" {...props} bind:value={$formData.password} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="mt-2 w-full">Submit</Form.Button>
</form>
