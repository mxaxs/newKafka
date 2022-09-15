"use strict";
const DbMixin = require("../mixins/hubs.db.mixin");
const Sequelize = require( "sequelize" );

module.exports = {
	name: "hub",
	mixins: [DbMixin( "hub" )],
	model: {
		name: "hub",
		define: {
			id: {primaryKey: true,autoIncrement: true,type: Sequelize.INTEGER},
			code: Sequelize.STRING,
			name: Sequelize.STRING,
			cnpj: Sequelize.STRING,
			zip_code: Sequelize.STRING,
			contact_email: Sequelize.STRING,
			contact_phone: Sequelize.STRING,
			contact_name: Sequelize.STRING,
			uuid: Sequelize.STRING,
			logo: Sequelize.STRING,
			active: Sequelize.BOOLEAN,
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		},
		options:{},
	},
	settings: {
		fields: [
			"id",
			"code",
			"name",
			"cnpj",
			"zip_code",
			"contact_email",
			"contact_phone",
			"contact_name",
			"uuid",
			"logo",
			"active",
			"createdAt",
			"updatedAt",
		],
		entityValidator: {
			name: {type: "string",min: 3,max: 255},
			contact_email: "string|email",
		},
	},
	actions: {
		test: {
			rest: {
				method: "GET",
				path: "/all-hubs",
			},
			async handler () {
				//this.broker.call("$hub.health").then(res => console.log(res));
				return this.schema.adapter.db.query("SELECT * FROM hubs WHERE id != '2'")
					.then(([res, metadata]) => res);
			},
		},
		hello: {
			rest: {
				method: "GET",
				path: "/hello"
			},
			async handler () {
				return "Hello from hub service";
			}

		}
	},
	events: {
		"hub.*"(ctx) {
			console.log("Payload:", ctx.params);
			console.log("Sender:", ctx.hubID);
			console.log("Metadata:", ctx.meta);
			console.log("The called event name:", ctx.eventName);
		}
	},
	methods: {
		async test () {
			return this.schema.adapter.db.query( "SELECT * FROM hubs WHERE id != '2'" )
				.then( ( [res, metadata] ) => res );
		},
	},
	async created () {

		console.log( "hub service created" );

	},

	async started () {

		this.schema.adapter.db.addHook( "afterFind", "hub", ( result ) => {
			console.warn( "afterFind\n", JSON.stringify(result.dataValues) );
		} );
		this.schema.adapter.db.addHook( "afterSave", "hub", async ( result ) => {

			console.warn( "afterSave\n", JSON.stringify(result.dataValues) );

		} );
		console.log("STARTED");
	},
	async stopped () {
		console.log("STOPPED");
	},

};
