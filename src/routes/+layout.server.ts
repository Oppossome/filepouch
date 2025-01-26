import { user } from "$lib/resources"

import type { LayoutServerLoad } from "./$types"

export const load: LayoutServerLoad = async (event) => ({
	local_user: event.locals.user ? user.parse(event.locals.user) : undefined,
})
