import { z } from "zod"

const userName = z
	.string()
	.min(3)
	.max(32)
	.regex(/^[a-z0-9_-]+$/)
const userPassword = z.string().min(6).max(255)

export const loginSchema = z.object({
	username: userName,
	password: userPassword,
})

export const registerSchema = z
	.object({
		username: userName,
		password: userPassword,
		password_confirmation: userPassword,
	})
	.refine((data) => data.password === data.password_confirmation, {
		message: "Passwords do not match",
		path: ["password_confirmation"],
	})
