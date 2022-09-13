"use strict";
const DbMixin = require("../mixins/users.db.mixin");
const Sequelize = require( "sequelize" );
const { Kafka } = require( "kafkajs" );
const kafka = new Kafka( {
	logLevel: 4,
	clientId: "user-service",
	brokers: ["kafka:9092"]
});
const producer = kafka.producer();
const consumer = kafka.consumer( { groupId: "user" } );

module.exports = {
	name: "user",
	mixins: [DbMixin( "user" )],
	model: {
		name: "user",
		define: {
			name: Sequelize.STRING,
			surname: Sequelize.STRING,
			email: Sequelize.STRING,
			createdAt: Sequelize.DATE,
			updatedAt: Sequelize.DATE,
		},
		options:{},
	},
	settings: {
		fields: [
			"id",
			"name",
			"surname",
			"email",
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
				path: "/test"
			},
			async handler () {
				//this.broker.call("$node.health").then(res => console.log(res));
				return this.schema.adapter.db.query("SELECT * FROM users WHERE id != '2'")
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
						topic: "user",
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
		"user.*"(ctx) {
			console.log("Payload:", ctx.params);
			console.log("Sender:", ctx.nodeID);
			console.log("Metadata:", ctx.meta);
			console.log("The called event name:", ctx.eventName);
		}
	},
	async started () {

		this.schema.adapter.db.addHook( "afterFind", "user", ( result ) => {
			console.warn( "afterFind\n", result[0].dataValues );
		} );
		this.schema.adapter.db.addHook( "afterSave", "user", async ( result ) => {

			await producer.connect();
			const res = await producer.send({
				topic: "user",
				acks: 1,
				messages:[ {key:"new-user", value: JSON.stringify(result.dataValues)}]
			});
			await producer.disconnect();
			console.warn( "afterSave\n", result.dataValues );
		} );

		// Consuming
		await consumer.connect();
		await consumer.subscribe({ topic: "user", fromBeginning: true });

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
