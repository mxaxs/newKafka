"use strict";
module.exports = {
	name: "docsign",
	mixins: [],
	settings: {},
	channels: {
		async "docsign.sign"( payload ) {
			console.log( ">>> docsign.sign <<<", payload );
			this.broker.call( "sign", payload );
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
				console.log( ">>> docsign.sign <<<", ctx.params );
				return ctx.params;
			}
		},
	},
	events: {},
	methods: {},
	created () { },
	started () { },
	stopped () { },
};
