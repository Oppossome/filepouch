// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: import("$lib/server/auth").SessionValidationResult["user"]
			session: import("$lib/server/auth").SessionValidationResult["session"]
			server: {
				auth: import("$lib/server/auth").AuthProvider
				db: Awaited<ReturnType<import("$lib/server/database").DatabaseProvider["get"]>>
				file: import("$lib/server/file").FileProvider
			}
		}
	}
}

export {}
