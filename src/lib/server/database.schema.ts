import * as t from "drizzle-orm/pg-core"

// MARK: Base

// This is a base resource that all other resources will inherit from.
export const baseResource = {
	id: t
		.uuid("id")
		.primaryKey()
		.$default(() => crypto.randomUUID()),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").$onUpdate(() => new Date()),
}

// MARK: User

export const user = t.pgTable(
	"user",
	{
		...baseResource,
		username: t.text("username").notNull().unique(),
		passwordHash: t.text("password_hash").notNull(),
	},
	(table) => [t.index("user_created_at_idx").on(table.createdAt)],
)

export type User = typeof user.$inferSelect

// MARK: Session

export const session = t.pgTable("session", {
	id: t.text("id").primaryKey(),
	userId: t
		.uuid("user_id")
		.notNull()
		.references(() => user.id),
	expiresAt: t.timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
})

export type Session = typeof session.$inferSelect

// MARK: Upload

export const upload = t.pgTable(
	"upload",
	{
		...baseResource,
		fileName: t.text("file_name").notNull(), // The original name of the file
		filePath: t.text("file_path").notNull(), // The path to the file on the server
		fileSize: t.integer("file_size").notNull(), // The size of the file in bytes
		fileType: t.text("file_type").notNull(), // The MIME type of the file
		userId: t
			.uuid("user_id")
			.notNull()
			.references(() => user.id),
	},
	(table) => [t.index("upload_created_at_idx").on(table.createdAt)],
)

export type Upload = typeof upload.$inferSelect
