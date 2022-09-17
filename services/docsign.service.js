"use strict";
module.exports = {
	name: "docsign",
	mixins: [],
	settings: {},
	channels: {
		async "docsign.sign"( payload ) {
			console.log( ">>> docsign.sign <<<", payload );
			this.sign( payload );
		},

	},
	actions: {
		//Action to get the QrCode page from Vidaas
		sign: {
			rest: {
				method: "POST",
				path: "/sign"
			},
			params: {
				cpf: "string",
			},
			async handler ( ctx ) {
				console.log( ">>> docsign.sign action <<<", ctx.params );
				return ctx.params;
			}
		},
	},
	events: {},
	methods: {
		async sign ( payload ) {
			console.log( ">>> docsign.sign method <<<", payload );
			return payload;
		}
	},
	created () { },
	started () { },
	stopped () { },
};
