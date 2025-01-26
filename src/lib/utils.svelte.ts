// MARK: useIntersectionObserver

/**
 * A custom hook that observes an element, returning the details as a rune.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { useIntersectionObserver } from '$lib/utils'
 *
 *   const element: HTMLElement | undefined = $state()
 *   const elementIntersection = useIntersectionObserver(() => element)
 *
 *   $inspect(observerDetails.value)
 * </script>
 *
 * <div bind:this={element}>
 *	Is On Screen: {elementIntersection.value?.isIntersecting}
 * </div>
 * ```
 */
export function useIntersectionObserver(opts: {
	element: HTMLElement | undefined
	options?: IntersectionObserverInit | undefined
}): { value: IntersectionObserverEntry | undefined } {
	let observerEntry: IntersectionObserverEntry | undefined = $state()

	// Ensure we're always using the correct observer options
	$effect(() => {
		const observer = new IntersectionObserver((entries) => {
			observerEntry = entries[0]
		}, opts.options)

		// Ensure we're always observing the up to date element
		$effect(() => {
			// If the element is undefined, don't observe
			if (!opts.element) return

			observer.observe(opts.element)
			return () => observer.unobserve(opts.element!)
		})

		// When no longer utilized, disconnect the observer
		return () => observer?.disconnect()
	})

	return {
		get value() {
			return observerEntry
		},
	}
}

// MARK: onIntersecting

export function onIntersecting(
	element: HTMLElement,
	{ callback, ...opts }: IntersectionObserverInit & { callback: (isIntersecting: boolean) => void },
) {
	const observer = useIntersectionObserver({ element, ...opts })
	const intersecting = $derived(observer.value?.isIntersecting ?? false)
	$effect(() => callback(intersecting))
}
