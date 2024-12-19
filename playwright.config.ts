import { defineConfig } from "@playwright/test"

export default defineConfig({
	webServer: {
		command: "pnpm build --mode development && PW_TEST=true pnpm preview",
		port: 4173,
	},

	globalSetup: "./e2e/meta/global-setup.ts",
	testDir: "e2e",
})
