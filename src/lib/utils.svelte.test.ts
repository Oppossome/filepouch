import { useIntersectionObserver } from "./utils.svelte"

// MARK: Mocks

const mocks = vi.hoisted(() => ({
	observe: vi.fn<IntersectionObserver["observe"]>(),
	unobserve: vi.fn<IntersectionObserver["unobserve"]>(),
	disconnect: vi.fn<IntersectionObserver["disconnect"]>(),
}))

const mockObserver = vi.fn(
	(
		callback: (entries: Partial<IntersectionObserverEntry>[]) => void,
		_options: IntersectionObserverInit,
	) => ({
		observe: mocks.observe,
		unobserve: mocks.unobserve,
		disconnect: mocks.disconnect,
		trigger: (entries: Partial<IntersectionObserverEntry>) => callback([entries]),
	}),
)

// MARK: Lifecycle

beforeEach(() => {
	vi.stubGlobal("IntersectionObserver", mockObserver)
})

afterEach(() => {
	vi.unstubAllGlobals()
})

// MARK: useIntersectionObserver

describe("useIntersectionObserver", () => {
	test("It should react to element and options changes", () =>
		$effect.root(() => {
			const observerOpts: Parameters<typeof useIntersectionObserver>[0] = $state({
				element: undefined,
				options: {},
			})

			const observerDetails = useIntersectionObserver(observerOpts)

			// No element to observer
			expect(observerDetails.value).toBeNull()
			expect(mockObserver).toHaveBeenCalledTimes(1)

			// Set element to observe
			observerOpts.element = document.createElement("div")
			expect(mocks.observe, "Wasn't observed").toHaveBeenCalledTimes(1)
			expect(mockObserver, "Inappropriately reinstantiated").toHaveBeenCalledTimes(1)

			// Unset element to observe
			observerOpts.element = undefined
			expect(mocks.unobserve, "Wasn't cleaned up").toHaveBeenCalledTimes(1)
			expect(mockObserver, "Inappropriately reinstantiated").toHaveBeenCalledTimes(1)

			// Set options
			observerOpts.options = { root: document.body }
			expect(mocks.disconnect, "Wasn't cleaned up").toHaveBeenCalledTimes(1)
			expect(mockObserver, "Wasn't reinstantiated").toHaveBeenCalledTimes(2)
		})())

	test("It should update the observer entry", () =>
		$effect.root(() => {
			const observerDetails = useIntersectionObserver({
				element: document.createElement("div"),
				options: {},
			})

			expect(observerDetails.value).toBeNull() // No entry yet
			expect(mockObserver).toHaveBeenCalledTimes(1)

			// Trigger
			mockObserver.mock.results[0].value.trigger({ isIntersecting: true })
			expect(observerDetails.value).toEqual({ isIntersecting: true })

			// Trigger again
			mockObserver.mock.results[0].value.trigger({ isIntersecting: false })
			expect(observerDetails.value).toEqual({ isIntersecting: false })
		})())
})
