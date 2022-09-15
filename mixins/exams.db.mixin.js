const DbService = require("moleculer-db");
const SqlAdapter = require( "moleculer-db-adapter-sequelize" );
const fs = require( "fs" );

module.exports = function ( collection ) {
	const schema = {
		mixins: [DbService]
	};

	schema.adapter = new SqlAdapter( {
		dialect: "postgres",
		username: "nexarxm",
		password: "GM7oPwi6BFtobLYFcGcdOg",
		host: "free-tier14.aws-us-east-1.cockroachlabs.cloud",
		port: 26257,
		dialectOptions: {
			ssl: {
				ca: fs.readFileSync( "./certs/root.crt").toString()
			},
			sslmode: "verify-full",
		},
		loggin: true,
		database: "nexar-xm-4153.examsnxr",

	} );
	schema.collection = collection;
	return schema;
};
