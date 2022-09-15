"use strict";
const DbMixin = require("../mixins/nodes.db.mixin");
const Sequelize = require( "sequelize" );
const { Kafka } = require( "kafkajs" );
const kafka = new Kafka( {
	logLevel: 4,
	clientId: "node-service",
	brokers: ["kafka1:19092"]
});
const producer = kafka.producer();
const consumer = kafka.consumer( { groupId: "node" } );

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
				try {
					const getRandomNumber = () => Math.round(Math.random(10) * 1000);
					const createMessage = num => ({
						key: `key-${num}`,
						value: `value-${num}-${new Date().toISOString()}`,
					});
					await producer.connect();
					const res = await producer.send({
						topic: "node",
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
			console.warn( "afterFind\n", JSON.stringify(result.dataValues) );
		} );
		this.schema.adapter.db.addHook( "afterSave", "node", async ( result ) => {

			await producer.connect();
			const res = await producer.send({
				topic: "node",
				acks: 1,
				messages:[ {key:"new-node", value: JSON.stringify(result.dataValues)}]
			});
			await producer.disconnect();
			console.warn( "afterSave\n", result.dataValues );
		} );

		// Consuming
		await consumer.connect();
		await consumer.subscribe({ topic: "node", fromBeginning: true });

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
