const DbService = require("moleculer-db");
const SqlAdapter = require( "moleculer-db-adapter-sequelize" );
const fs = require( "fs" );

module.exports = function ( collection ) {
	const schema = {
		mixins: [DbService]
	};

	schema.adapter = new SqlAdapter( {
		dialect: "postgres",
		username: "nexarxm-sp",
		password: "hJK9mbVeO6kWa_TKA17w-w",
		host: "free-tier10.gcp-southamerica-east1.cockroachlabs.cloud",
		port: 26257,
		dialectOptions: {
			ssl: {
				ca: fs.readFileSync( "./certs/root-sp.crt").toString()
			},
			sslmode: "verify-full",
		},
		loggin: true,
		database: "nexar-sp-288.nexarxm",

	} );
	schema.collection = collection;
	return schema;
};
