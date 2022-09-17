"use strict";
const DbMixin = require("../mixins/exams.db.mixin");
const Sequelize = require( "sequelize" );
const Redis = require( "ioredis" );
const redis = new Redis(
	{
		host: "redis",
		port: 6379,
		db: 3,
		password: "setecodemiguelsete7sete",
	}
);
module.exports = {
	name: "exams",
	mixins: [DbMixin( "exams" )],
	model: {
		name: "exams",
		define: {
			id:{primaryKey: true,autoIncrement: true,type: Sequelize.INTEGER},
			uuid: Sequelize.STRING,
			hd: Sequelize.STRING,
			cid: Sequelize.STRING,
			crm_origin: Sequelize.INTEGER,
			crm_appraise: Sequelize.INTEGER,
			medic_name: Sequelize.STRING,
			project: Sequelize.INTEGER,
			status: Sequelize.INTEGER,
			exam: Sequelize.STRING,
			category: Sequelize.STRING,
			priority: Sequelize.INTEGER,
			name: Sequelize.STRING,
			sex: Sequelize.STRING,
			obs: Sequelize.STRING,
			exam_motive: Sequelize.STRING,
			appraised: Sequelize.DATE,
			rejected: Sequelize.STRING,
			condition: Sequelize.STRING,
			printed:Sequelize.BOOLEAN,
			senderid: Sequelize.INTEGER,
			email: Sequelize.STRING,
			phone: Sequelize.STRING,
			register: Sequelize.STRING,
			cpf: Sequelize.STRING,
			age: Sequelize.INTEGER,
			birthdate: Sequelize.DATE,
			examhash: Sequelize.STRING,
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		},
		options:{},
	},
	settings: {
		fields: [
			"id",
			"uuid",
			"hd",
			"cid",
			"crm_origin",
			"crm_appraise",
			"medic_name",
			"project",
			"status",
			"exam",
			"category",
			"priority",
			"name",
			"sex",
			"obs",
			"exam_motive",
			"appraised",
			"rejected",
			"condition",
			"printed",
			"senderid",
			"email",
			"phone",
			"register",
			"cpf",
			"age",
			"birthdate",
			"examhash",
			"updatedAt",
			"createdAt"
		],
		entityValidator: {
			name: {type: "string",min: 3,max: 255},
			exam: {type: "string",min: 3,max: 855}
		},
	},
	actions: {
		test: {
			rest: {
				method: "GET",
				path: "/all-examss",
			},
			async handler () {
				//this.broker.call("$exams.health").then(res => console.log(res));
				return this.schema.adapter.db.query("SELECT * FROM exams WHERE id != '2'")
					.then( ( [res, metadata] ) => {
						this.broker.sendToChannel( "exams.created", res );
						redis.set( "exams", JSON.stringify( res ), "EX", 60 );
						return res;
					} );
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
		"exams.*"(ctx) {
			console.log("Payload:", ctx.params);
			console.log("Sender:", ctx.examsID);
			console.log("Metadata:", ctx.meta);
			console.log("The called event name:", ctx.eventName);
		}
	},
	methods: {
		async test () {
			return this.schema.adapter.db.query( "SELECT * FROM exams WHERE id != '2'" )
				.then( ( [res, metadata] ) => res );
		},
	},
	async created () {

		console.log( "exams service created" );

	},

	async started () {
		this.schema.adapter.db.addHook( "afterFind", "exams", ( result ) => {
			console.warn( "afterFind\n", JSON.stringify( result.dataValues ) );
		} );
		this.schema.adapter.db.addHook( "afterSave", "exams", async ( result ) => {
			console.warn( "afterSave\n", JSON.stringify( result.dataValues ) );

		} );


		console.log( "STARTED" );

	},

	async stopped () {
		console.log("STOPPED");
	},

};
