import { z } from "zod"

// MARK: User Schemas

export const user_name = z
	.string()
	.min(3)
	.max(32)
	.regex(/^[a-z0-9_-]+$/)

export const user_password = z.string().min(6).max(255)
