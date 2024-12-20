import { defineConfig } from "@playwright/test"

const isCI = !!process.env.CI

export default defineConfig({
	webServer: {
		command: "pnpm build --mode development && PW_TEST=true pnpm preview",
		reuseExistingServer: !process.env.CI,
		stdout: isCI ? "ignore" : "pipe",
		port: 4173,
	},

	globalSetup: "./e2e/meta/global-setup.ts",
	testDir: "e2e",
})
