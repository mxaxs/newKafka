"use strict";
const DbMixin = require("../mixins/hubs.db.mixin");
const Sequelize = require( "sequelize" );
const { Kafka } = require( "kafkajs" );
const kafka = new Kafka( {
	logLevel: 4,
	clientId: "hub-service",
	brokers: ["kafka:9092"]
});
const producer = kafka.producer();
const consumer = kafka.consumer( { groupId: "hub" } );

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
				try {
					const getRandomNumber = () => Math.round(Math.random(10) * 1000);
					const createMessage = num => ({
						key: `key-${num}`,
						value: `value-${num}-${new Date().toISOString()}`,
					});
					await producer.connect();
					const res = await producer.send({
						topic: "hub",
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

			await producer.connect();
			const res = await producer.send({
				topic: "hub",
				acks: 1,
				messages:[ {key:"new-hub", value: JSON.stringify(result.dataValues)}]
			});
			await producer.disconnect();
			console.warn( "afterSave\n", result.dataValues );
		} );

		// Consuming
		await consumer.connect();
		await consumer.subscribe({ topic: "hub", fromBeginning: true });

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
	async stopped () {
		console.log("STOPPED");
	},

};
