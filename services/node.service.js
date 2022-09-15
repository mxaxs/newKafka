"use strict";
const DbMixin = require("../mixins/nodes.db.mixin");
const Sequelize = require( "sequelize" );


module.exports = {
	name: "node",
	mixins: [DbMixin( "node" )],
	model: {
		name: "node",
		define: {
			id: {primaryKey: true,autoIncrement: true,type: Sequelize.INTEGER},
			name: Sequelize.STRING,
			address_name: Sequelize.STRING,
			address_number: Sequelize.STRING,
			zip_code: Sequelize.STRING,
			contact_email: Sequelize.STRING,
			contact_phone: Sequelize.STRING,
			contact_name: Sequelize.STRING,
			head_medic_name: Sequelize.STRING,
			head_medic_email: Sequelize.STRING,
			head_medic_phone: Sequelize.STRING,
			cnpj: Sequelize.STRING,
			logo: Sequelize.STRING,
			hub_id: Sequelize.INTEGER,
			active: Sequelize.BOOLEAN,
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		},
		options:{},
	},
	settings: {
		fields: [
			"id",
			"name",
			"address_name",
			"address_number",
			"zip_code",
			"contact_email",
			"contact_phone",
			"contact_name",
			"head_medic_name",
			"head_medic_email",
			"head_medic_phone",
			"cnpj",
			"logo",
			"hub_id",
			"active",
			"createdAt",
			"updatedAt",
		],
		entityValidator: {
			hub_id: {type: "number",positive: true,convert: true},
			name: {type: "string",min: 3,max: 255},
			contact_email: "string|email",
		},
	},
	actions: {
		test: {
			rest: {
				method: "GET",
				path: "/all-nodes",
			},
			async handler () {
				//this.broker.call("$node.health").then(res => console.log(res));
				return this.schema.adapter.db.query("SELECT * FROM nodes WHERE id != '2'")
					.then(([res, metadata]) => res);
			},
		},
		hello: {
			rest: {
				method: "GET",
				path: "/hello"
			},
			async handler () {
				return "Hello Moleculer";
			}

		}
	},
	events: {
		"node.*"(ctx) {
			console.log("Payload:", ctx.params);
			console.log("Sender:", ctx.nodeID);
			console.log("Metadata:", ctx.meta);
			console.log("The called event name:", ctx.eventName);
		}
	},
	methods: {
		async test () {
			return this.schema.adapter.db.query( "SELECT * FROM nodes WHERE id != '2'" )
				.then( ( [res, metadata] ) => res );
		},
	},
	async created () {

		console.log( "Node service created" );

	},

	async started () {

		this.schema.adapter.db.addHook( "afterFind", "node", ( result ) => {
			console.warn( "afterFind\n", JSON.stringify( result.dataValues ) );
		} );
		this.schema.adapter.db.addHook( "afterSave", "node", async ( result ) => {
			console.warn( "afterSave\n", JSON.stringify( result.dataValues ) );

		} );


		console.log( "STARTED" );

	},

	async stopped () {
		console.log("STOPPED");
	},

};
