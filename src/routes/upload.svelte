<script lang="ts">
	import { File, Trash2 } from "lucide-svelte"
	import prettyBytes from "pretty-bytes"
	import { type Snippet } from "svelte"
	import { fly } from "svelte/transition"

	import * as AlertDialog from "$lib/components/ui/alert-dialog"
	import * as Button from "$lib/components/ui/button"

	import { UploadContext } from "./upload.svelte.ts"

	interface Props {
		children: Snippet<[]>
	}

	let { children }: Props = $props()

	const uploadContext = new UploadContext()
	const { uploadMutation } = uploadContext
</script>

{@render children()}

<svelte:window
	ondragover={(event) => {
		uploadContext.dragOver = true
		uploadContext.open = true
		event.preventDefault()
	}}
	ondragleave={(event) => {
		uploadContext.dragOver = false
		event.preventDefault()
	}}
	ondrop={(event) => {
		uploadContext.addFiles(event.dataTransfer?.files)
		uploadContext.dragOver = false
		event.preventDefault()
	}}
/>

<AlertDialog.Root bind:open={uploadContext.open}>
	<AlertDialog.Content>
		<div class="c_upload">
			<AlertDialog.Header>
				<AlertDialog.Title>Upload</AlertDialog.Title>
			</AlertDialog.Header>

			<form
				action="/?/upload"
				class:dragover={uploadContext.dragOver}
				enctype="multipart/form-data"
				method="post"
			>
				<label class="dnd-field rounded">
					<span class="drop">Drag & Drop</span> or
					<span class="select">Select Files</span> to Upload
					<input
						type="file"
						name="file"
						multiple
						onchange={(event) => {
							uploadContext.addFiles(event.currentTarget.files)
							event.currentTarget.files = null
						}}
					/>
				</label>
			</form>

			<div class="upload-items">
				{#each uploadContext.files as file (file)}
					<div class="item" in:fly={{ x: -5 }}>
						<div class="left">
							<File />
							<div class="details">
								<span class="name">{file.name}</span>
								<span class="size">{prettyBytes(file.size)}</span>
							</div>
						</div>
						<Button.Root
							class="delete"
							variant="ghost"
							onclick={() => {
								uploadContext.files = uploadContext.files.filter((f) => f !== file)
							}}
						>
							<Trash2 />
						</Button.Root>
					</div>
				{/each}
			</div>
		</div>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={() => (uploadContext.open = false)}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				disabled={!uploadContext.files?.length || $uploadMutation.isPending}
				onclick={() => $uploadMutation.mutate()}
			>
				Upload
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<style lang="postcss">
	.c_upload {
		display: contents;

		& form {
			border-radius: 0.5rem;
			background: hsl(var(--muted-foreground) / 10%);
			transition:
				padding 0.5s ease-in-out,
				background-color 0.5s ease-in-out,
				border-color 0.5s ease-in-out,
				color 0.5s ease-in-out;

			& label {
				cursor: pointer;

				display: flex;
				gap: 0.25rem;
				align-items: center;
				justify-content: center;

				padding: 3rem 0;
				border: 3px dashed hsl(var(--muted-foreground) / 20%);
				border-radius: inherit;

				font-size: 0.875rem;

				& .select {
					text-decoration: underline;
				}
			}

			&.dragover {
				padding: 0.5rem;
				background: theme("colors.blue.500/.1");

				& label {
					border-color: theme("colors.blue.500/.5");
				}
			}

			& input {
				display: none;
			}
		}

		& .upload-items {
			overflow: hidden auto;
			display: flex;
			flex-direction: column;
			max-height: 12rem;

			&:empty {
				display: none;
			}

			& .item {
				display: flex;
				align-items: center;
				justify-content: space-between;

				& .left {
					display: flex;
					gap: 0.5rem;
					align-items: center;

					& .details {
						display: flex;
						flex-direction: column;
						font-size: 0.875rem;
						line-height: 1rem;

						& .size {
							font-size: 0.75rem;
							line-height: 1rem;
							color: hsl(var(--muted-foreground));
						}
					}
				}

				& :global(.delete) {
					width: 2.25rem;
					height: 2.25rem;
					border-radius: 999rem;
					color: hsl(var(--muted-foreground));

					&:hover {
						color: hsl(var(--foreground));
					}
				}
			}
		}
	}
</style>
