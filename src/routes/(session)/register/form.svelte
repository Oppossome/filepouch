<script lang="ts">
	import { zodClient } from "sveltekit-superforms/adapters"
	import { superForm } from "sveltekit-superforms"

	import * as Form from "$lib/components/ui/form"
	import { Input } from "$lib/components/ui/input"

	import { registerSchema } from "../schema"

	const form = superForm(
		{
			username: "",
			password: "",
			password_confirmation: "",
		},
		{
			validators: zodClient(registerSchema),
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
	<Form.Field {form} name="password_confirmation">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label>Confirm Password</Form.Label>
				<Input type="password" {...props} bind:value={$formData.password_confirmation} />
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>
	<Form.Button class="mt-2 w-full">Submit</Form.Button>
</form>
