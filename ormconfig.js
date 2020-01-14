module.exports = [
	{
		name: "default",
		type: "mysql",
		host: "localhost",
		port: 3306,
		username: "travnlrb_site_user",
		password: "PN8nU0hV8g+k",
		database: "travnlrb_site_db",
		synchronize: true,
		logging: false,
		entities: ["src/entity/**/*.ts"],
		migrations: ["src/migration/**/*.ts"],
		subscribers: ["src/subscriber/**/*.ts"],
		cli: {
			entitiesDir: "src/entity",
			migrationsDir: "src/migration",
			subscribersDir: "src/subscriber"
		}
	},
	{
		name: "test",
		type: "mysql",
		host: "0.0.0.0",
		port: 3306,
		username: "jdev",
		password: "password",
		dropSchema: true,
		database: "traveltng",
		synchronize: true,
		logging: false,
		entities: ["src/entity/**/*.ts"],
		migrations: ["src/migration/**/*.ts"],
		subscribers: ["src/subscriber/**/*.ts"],
		cli: {
			entitiesDir: "src/entity",
			migrationsDir: "src/migration",
			subscribersDir: "src/subscriber"
		}
	}
];
