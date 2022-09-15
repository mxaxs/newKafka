"use strict";
const DbMixin = require("../mixins/projects.db.mixin");
const Sequelize = require( "sequelize" );
const { Kafka } = require( "kafkajs" );
const kafka = new Kafka( {
	logLevel: 4,
	clientId: "project-service",
	brokers: ["kafka1:19092"]
});
const producer = kafka.producer();
const consumer = kafka.consumer( { groupId: "project" } );

module.exports = {
	name: "project",
	mixins: [DbMixin( "project" )],
	model: {
		name: "project",
		define: {
			id: {primaryKey: true,autoIncrement: true,type: Sequelize.INTEGER},
			company_id: Sequelize.INTEGER,
			project_name: Sequelize.STRING,
			project_contact_email: Sequelize.STRING,
			project_contact_phone: Sequelize.STRING,
			project_contact_name: Sequelize.STRING,
			exams_enabled:  {default: [],type: Sequelize.JSONB},
			exams_contacts:  {default: [],type: Sequelize.JSONB},
			logo: Sequelize.STRING,
			cover: Sequelize.STRING,
			node:  Sequelize.INTEGER,
			active: Sequelize.BOOLEAN,
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		},
		options:{},
	},
	settings: {
		fields: [
			"id",
			"company_id",
			"project_name",
			"project_contact_email",
			"project_contact_phone",
			"project_contact_name",
			"exams_enabled",
			"exams_contacts",
			"logo",
			"cover",
			"node",
			"active",
			"createdAt",
			"updatedAt",
		],
		entityValidator: {
			company_id: {type: "number",positive: true,convert: true},
			project_name: {type: "string",min: 3,max: 255},
			project_contact_email: "string|email",
		},
	},
	actions: {
		test: {
			rest: {
				method: "GET",
				path: "/all-projects",
			},
			async handler () {
				//this.broker.call("$node.health").then(res => console.log(res));
				return this.schema.adapter.db.query("SELECT * FROM projects WHERE id != '2'")
					.then(([res, metadata]) => res);
			},
		},
		hello: {
			rest: {
				method: "GET",
				path: "/hello"
			},
			async handler () {
				try {
					const getRandomNumber = () => Math.round(Math.random(10) * 1000);
					const createMessage = num => ({
						key: `key-${num}`,
						value: `value-${num}-${new Date().toISOString()}`,
					});
					await producer.connect();
					const res = await producer.send({
						topic: "project",
						acks: 1,
						messages: Array(getRandomNumber())
							.fill()
							.map(_ => createMessage(getRandomNumber()))
					});
					await producer.disconnect();
					return `Message sent successfully! ${res}`;
				} catch ( error ) {
					await producer.disconnect();
					return `[example/producer] ${error}`;
				}
			}

		}
	},
	events: {
		"project.*"(ctx) {
			console.log("Payload:", ctx.params);
			console.log("Sender:", ctx.nodeID);
			console.log("Metadata:", ctx.meta);
			console.log("The called event name:", ctx.eventName);
		}
	},
	async started () {

		this.schema.adapter.db.addHook( "afterFind", "project", ( result ) => {
			console.warn( "afterFind\n", JSON.stringify(result.dataValues) );
		} );
		this.schema.adapter.db.addHook( "afterSave", "project", async ( result ) => {

			await producer.connect();
			const res = await producer.send({
				topic: "project",
				acks: 1,
				messages:[ {key:"new-project", value: JSON.stringify(result.dataValues)}]
			});
			await producer.disconnect();
			console.warn( "afterSave\n", result.dataValues );
		} );

		// Consuming
		await consumer.connect();
		await consumer.subscribe({ topic: "project", fromBeginning: true });

		await consumer.run({
			eachMessage: async ( { topic, partition, message } ) => {
				const mKey = message.key ? message.key.toString() : "no key";
				console.log({
					partition,
					offset: message.offset,
					key: mKey,
					value: message.value.toString(),
				});
			},
		} );
		console.log("STARTED");
	},
};
