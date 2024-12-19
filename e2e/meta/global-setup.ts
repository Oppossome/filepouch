import { env } from "process"

import { GenericContainer, Wait } from "testcontainers"

export default async function globalSetup() {
	// Initialize the database container
	const dbContainer = await new GenericContainer("postgres")
		.withEnvironment({ POSTGRES_USER: "root", POSTGRES_PASSWORD: "password" })
		.withExposedPorts(5432)
		.withWaitStrategy(Wait.forLogMessage("database system is ready to accept connections"))
		.start()

	// Store the database connection string
	env.DATABASE_URL = `postgres://root:password@localhost:${dbContainer.getMappedPort(5432)}`

	// Global Teardown
	// https://arc.net/l/quote/uynkzvcr
	return async () => await dbContainer.stop()
}
