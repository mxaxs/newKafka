"use strict";
module.exports = {
	name: "channel",
	settings: {},
	channels: {
		// Shorthand format
		// In this case the consumer group is the service full name
		async "user.created" ( payload ) {
			// Do something with the payload
			// You should throw error if you want to NACK the message processing.
			console.log( "user.created", payload );
		},

		"user.updated": {
			// Using custom consumer-group
			group: "other",
			async handler ( payload ) {
				// Do something with the payload
				// You should throw error if you want to NACK the message processing.
				console.log( "user.updated", payload );
			}
		},

		"exams.created"( payload ) {
			console.log( ">>> exams.created <<<", payload );
		},
	},
};

