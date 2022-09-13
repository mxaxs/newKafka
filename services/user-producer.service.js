"use strict";
const kafka = require( "kafka-node" );

module.exports = {

	name: "user-producer",
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
				const client = new kafka.KafkaClient( { kafkaHost: "kafka:9092" } );
				const producer = new kafka.Producer( client );

				producer.on( "ready", function () {
					producer.send( [
						{ topic: "user", messages: "Success!!! This is awesome!", ack:1, partition: 0 }
					], function ( err, data ) {
						console.log( data );
					} );
				}
				);
				producer.on( "error", function ( err ) {
					console.log( err );
				}
				);
				return "Hello Moleculer";
			}

		}

	}

};
