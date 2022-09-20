"use strict";
const axios = require( "axios" );
const Redis = require( "ioredis" );
const redis = new Redis( { host: "redis", port: 6379, db: 3, password: "setecodemiguelsete7sete", } );
const baseURI = "https://certificado.vidaas.com.br/";
const pkceChallenge = require( "pkce-challenge" ).default;

axios.defaults.baseURL = baseURI;

module.exports = {
	name: "vidaas",
	mixins: [],
	settings: {},
	channels: {
		async "vidaas.uri"( payload ) {
			console.log( ">>> vidaas.uri <<<", payload );
			this.broker.call( "uri", payload );
		},
		async "vidaas.token"( payload ) {
			console.log( ">>> vidaas.token <<<", payload );
			this.broker.call( "ttl", payload );
		},
		async "vidaas.ttl"( payload ) {
			console.log( ">>> vidaas.ttl <<<", payload );
			this.broker.call( "ttl", payload );
		},
		async "vidaas.signature"( payload ) {
			console.log( ">>> vidaas.signature <<<", payload );
			this.broker.call( "signature", payload );
		},

	},
	actions: {
		//Action to get the QrCode page from Vidaas
		uri: {
			rest: {
				method: "POST",
				path: "/uri"
			},
			params: {
				cpf: "string",
				ttl: "number",
			},
			async handler ( ctx ) {

				try {
					const challenge = pkceChallenge();
					const { cpf, ttl } = ctx.params;
					const ttln = isNaN( ttl ) ? 43200 : ttl;
					redis.select( 3 );
					axios( {
						method: "GET",
						url: "v0/oauth/authorize",
						params: {
							code_challenge: challenge.code_challenge,
							code_challenge_method: "S256",
							response_type: "code",
							scope: "signature_session",
							login_hint: cpf,
							lifetime: ttln,
							redirect_uri: "https://imagexam.in/authvidaas",
							client_id: "c34c708b-d9c6-470b-a525-e37b3eec4f60"
						}
					} ).then( ( response ) => {
						const params = {
							location: response.request.socket._httpMessage._redirectable._options.href,
							code_challenge: challenge.code_challenge
						};
						redis.hmset( cpf, params ).then( ( result ) => {
							redis.expire( cpf, ttln );
							console.warn( "REDIS RESPONSE >>>>", result );
						} );
					} );
					return ctx.params;
				} catch ( error ) {
					return { error: error.message };
				}
			}
		},
		//Action to get the Token page from Vidaas
		token: {
			rest: {
				method: "POST",
				path: "/token"
			},
			params: {
				cpf: "string",
				code: "string"
			},
			async handler ( ctx ) {
				redis.select( 3 );
				const { cpf, code } = ctx.params;
				try {
					const code_verifier = await redis.hget( cpf, "code_challenge" );
					const result = await axios( {
						"method": "POST",
						"url": "v0/oauth/token",
						"headers": {
							"Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
						},
						"data": `client_id=c34c708b-d9c6-470b-a525-e37b3eec4f60&code_verifier=${ code_verifier }&code=${ code }&client_secret=qsaA0uo163VP4Q1f&grant_type=authorization_code`
					} );
					redis.hmset( cpf, { access_token: result.data.access_token } ).then( ( ret ) => {
						console.warn( "REDIS RESPONSE >>>>", ret );
						console.warn( "THE TOKEN PROCESS >>>", cpf, result.data.expires_in );
					} );
					return { token: result.data.access_token };
				} catch (error) {
					return { error: error.message };
				}
			}
		},
		//Acttion to get the time left to expire the token
		ttl: {
			rest: {
				method: "POST",
				path: "/ttl"
			},
			params: {
				cpf: "string",
			},
			async handler ( ctx ) {
				try {
					redis.select( 3 );
					const { cpf } = ctx.params;
					const ttl = await redis.ttl( cpf );
					return { ttl };
				} catch (error) {
					return { error };
				}


			}
		},
		//Action to get the signature page from Vidaas
		signature: {
			rest: {
				method: "POST",
				path: "/signature"
			},
			params: {
				cpf: "string",
				id: "string",
				hash: "string"
			},
			async handler ( ctx ) {
				try {
					const { cpf, id, hash } = ctx.params;
					redis.select( 3 );
					const access_token = await redis.hget( cpf, "access_token" );
					const result = await axios( {
						"method": "POST",
						"url": "v0/oauth/signature",
						"headers": {
							"Authorization": `Bearer ${ access_token }`,
							"Content-Type": "application/json",
							"Accept": "application/json"
						},
						"data": {
							"hashes": [
								{
									"id": id,
									"alias": id,
									"hash": hash,
									"hash_algorithm": "2.16.840.1.101.3.4.2.1",
									"signature_format": "CMS"
								}
							]
						}
					} );
					//Change to the correct redis database (signature)
					redis.select( 1 ); //signature
					redis.hmset( cpf, `${ id }`, result.data.signatures[0].raw_signature || "error" );
					const signature = await redis.hget( cpf, `${ id }` );
					return {signature: signature};
				} catch (error) {
					return {error};
				}
			}
		},
	},

	events: {
		"vidaas.*" ( ctx ) {
			console.log( "Payload:", ctx.params );
			console.log( "Sender:", ctx.vidaasID );
			console.log( "Metadata:", ctx.meta );
			console.log( "The called event name:", ctx.eventName );
		},
	},
	methods: {
		async uri ( params ) {
			return this.schema.adapter.db.query( "SELECT * FROM exams WHERE id != '2'" )
				.then( ( [res, metadata] ) => res );
		},
	},
	async created () {
		console.log( "vidaas service created" );
	},
	async started () {
		console.log( "vidaas service started" );
	},
	async stopped () {
		console.log( "vidaas service stopped" );
	},
};
