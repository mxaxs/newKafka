"use strict";
const DbMixin = require("../mixins/users.db.mixin");
const Sequelize = require( "sequelize" );


module.exports = {
	name: "user",
	mixins: [DbMixin( "user" )],
	model: {
		name: "user",
		define: {
			id: {primaryKey: true,autoIncrement: true,type: Sequelize.INTEGER},
			utype: Sequelize.INTEGER,
			name: Sequelize.STRING,
			surname: Sequelize.STRING,
			email: Sequelize.STRING,
			phone: Sequelize.STRING,
			access_level: Sequelize.STRING,
			scope:  {default: [],type: Sequelize.JSONB},
			password: Sequelize.STRING,
			doc_type: Sequelize.STRING,
			doc_id: Sequelize.STRING,
			doc_uf: Sequelize.STRING,
			avatar: Sequelize.STRING,
			bias: Sequelize.STRING,
			fbuid: Sequelize.STRING,
			active: Sequelize.BOOLEAN,
			projects: {default: [],type: Sequelize.JSONB},
			nodes:  {default: [],type: Sequelize.JSONB},
			hubs:  {default: [],type: Sequelize.JSONB},
			cpf: Sequelize.STRING,
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		},
		options:{},
	},
	settings: {
		fields: [
			"id",
			"utype",
			"name",
			"surname",
			"email",
			"phone",
			"access_level",
			"scope",
			"password",
			"doc_type",
			"doc_id",
			"doc_uf",
			"avatar",
			"bias",
			"fbuid",
			"active",
			"projects",
			"nodes",
			"hubs",
			"cpf",
			"createdAt",
			"updatedAt",
		],
		entityValidator: {
			name: "string|min:3",
			surname: "string|min:3",
			email: "string|email",
		},
	},
	actions: {
		test: {
			rest: {
				method: "GET",
				path: "/channel"
			},
			async handler () {
				this.broker.sendToChannel( "user.created", {
					id: 1234,
					items: [
						{ name: "Apple", price: 10 },
						{ name: "Orange", price: 5 }
					]
				} );
				//this.broker.call("$node.health").then(res => console.log(res));
				return this.schema.adapter.db.query( "SELECT * FROM users WHERE id != '2'" ).then( ( [res, metadata] ) => res );

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
		"user.*"(ctx) {
			console.log("Payload:", ctx.params);
			console.log("Sender:", ctx.nodeID);
			console.log("Metadata:", ctx.meta);
			console.log("The called event name:", ctx.eventName);
		}
	},
	async started () {

		this.schema.adapter.db.addHook( "afterFind", "user", ( result ) => {
			console.warn( "afterFind\n", JSON.stringify(result.dataValues) );
		} );
		this.schema.adapter.db.addHook( "afterSave", "user", async ( result ) => {

			console.warn( "afterSave\n", JSON.stringify(result.dataValues) );
			this.broker.sendToChannel( "user.created", result.dataValues );
		} );


		console.log("STARTED");
	},
};
