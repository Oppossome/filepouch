import { defineContextPair } from "./utils"

// MARK: Mocks

const mocks = vi.hoisted(() => ({
	getContext: vi.fn<typeof import("svelte").getContext>(),
	hasContext: vi.fn<typeof import("svelte").hasContext>(),
	setContext: vi.fn<typeof import("svelte").setContext>(),
}))

vi.mock("svelte", async (importOriginal) => ({
	...(await importOriginal<typeof import("svelte")>()),
	getContext: mocks.getContext,
	hasContext: mocks.hasContext,
	setContext: mocks.setContext,
}))

// MARK: Tests

describe("ContextPair", () => {
	const testPair = defineContextPair<number>("test")

	test("get", () => {
		// Context isn't set
		mocks.hasContext.mockReturnValue(false)
		expect(() => testPair.get()).toThrowError()
		expect(testPair.get(true)).toBeUndefined()

		// Context is set
		mocks.getContext.mockReturnValue(20)
		mocks.hasContext.mockReturnValue(true)
		expect(testPair.get()).toEqual(20)
		expect(testPair.get(true)).toEqual(20)
	})

	test("set", () => {
		testPair.set(1)
		expect(mocks.setContext).toBeCalledTimes(1)

		// Context is set
		mocks.hasContext.mockReturnValue(true)
		expect(() => testPair.set(2)).toThrowError()
		expect(mocks.setContext).toBeCalledWith("test", 1)

		expect(() => testPair.set(3, true)).not.toThrowError()
		expect(mocks.setContext).toBeCalledWith("test", 3)
	})
})
