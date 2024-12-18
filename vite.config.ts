import { defineConfig } from "vitest/config"
import { sveltekit } from "@sveltejs/kit/vite"

export default defineConfig({
	// @ts-expect-error - It works
	plugins: [sveltekit()],

	test: {
		/**
		 * Ensures no state is leaked between tests.
		 * https://vitest.dev/config/#mockreset
		 */
		mockReset: true,
		globals: true,
		include: ["src/**/*.{test,spec}.{js,ts}"],
	},
})
