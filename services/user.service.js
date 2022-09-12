"use strict";
const { Kafka } = require( "kafkajs" );

module.exports = {

	name: "user",
	actions: {
		test: {
			rest: {
				method: "GET",
				path: "/test"
			},
			async handler () {
				return "Hello Moleculer";
			},
		},
		hello: {
			rest: {
				method: "GET",
				path: "/hello"
			},
			async handler () {

				const kafka = new Kafka({
					clientId: "my-app",
					brokers: ["kafka:9092"]
				});

				const producer = kafka.producer();
				const consumer = kafka.consumer({ groupId: "user" });

				const run = async () => {
					// Producing
					await producer.connect();
					await producer.send({
						topic: "user",
						messages: [
							{ value: "Hello KafkaJS user!" },
						],
					});

					// Consuming
					await consumer.connect();
					await consumer.subscribe({ topic: "user", fromBeginning: true });

					await consumer.run({
						eachMessage: async ({ topic, partition, message }) => {
							console.log({
								partition,
								offset: message.offset,
								value: message.value.toString(),
							});
						},
					});
				};

				run().catch(console.error);
				return "Hello from User!";
			}

		}

	}

};
