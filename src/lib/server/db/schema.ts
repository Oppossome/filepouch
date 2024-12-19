import { integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

// MARK: Base

// This is a base resource that all other resources will inherit from.
export const baseResource = {
	id: uuid("id")
		.primaryKey()
		.$default(() => crypto.randomUUID()),
	createdAt: timestamp("created_at")
		.notNull()
		.$default(() => new Date()),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$onUpdate(() => new Date()),
}

// MARK: User

export const userRole = pgEnum("user_role", ["user", "admin"])

export type UserRole = (typeof userRole.enumValues)[number]

export const user = pgTable("user", {
	...baseResource,
	username: text("username").notNull().unique(),
	passwordHash: text("password_hash").notNull(),
	role: userRole("role")
		.notNull()
		.$default(() => "user"),
})

export type User = typeof user.$inferSelect

// MARK: Session

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
})

export type Session = typeof session.$inferSelect

// MARK: Upload

export const uploadVisibility = pgEnum("upload_visibility", ["public", "private"])

export type UploadVisibility = (typeof uploadVisibility.enumValues)[number]

export const upload = pgTable("upload", {
	...baseResource,
	filename: text("filename").notNull(),
	size: integer("size").notNull(),
	userId: uuid("user_id")
		.notNull()
		.references(() => user.id),
	visibility: uploadVisibility("visibility")
		.notNull()
		.$default(() => "private"),
})

export type Upload = typeof upload.$inferSelect
