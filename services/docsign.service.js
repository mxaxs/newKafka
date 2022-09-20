"use strict";
const moment = require( "moment" );
const fs = require( "fs" );
const { addSignaturePlaceholderToPdf, CertificationLevels, signPdf } = require( "pdf-signatures");
const Redis = require( "ioredis" );
const redis = new Redis( { host: "redis", port: 6379, db: 3, password: "setecodemiguelsete7sete", } );

module.exports = {
	/*
		PAYLOAD NEEDS TO BE:
		{
			"cpf": "09519170804",
			"id": "22",
			"patient_id": "string",
			"medic_name": "string",
			"medic_crm": "string",
			"exampath": "https://api-rest.in/exams/M%C3%A1rcio_213.pdf",
			"email": "string",
			"file-hash": "0787dd39120bdbe2306cc01edc6e4ae10865dac30f392c907522a7b8bba8ecde"
		}
	 */
	name: "docsign",
	mixins: [],
	settings: {},
	channels: {
		"docsign.sign": {
			group: "docsign",
			deadLettering: {
				enabled: true,
				maxRetries: 5,
				retryDelay: 1000,
				retryDelayFactor: 2,
				retryDelayMax: 10000,
				queueName: "docsign.deadletter",
			},
			async handler ( payload ) {
				console.log( ">>> docsign.sign <<<", payload );
				this.setPlaceHolder( payload ) //exampath, email, cpf
					.then( result => this.embedSeal( result ) //placeHolderFile, medic, crm
						.then( result => this.signDoc( result ) ) //id, patient_id, placeHoldedFile, signB64
						.then( result => this.broker.sendToChannel( "docsign.documentSigned", result ) ) );
			},
		},
	},
	actions: {},
	events: {},
	methods: {
		// Returns the file with placeholder added to the PDF
		async setPlaceHolder ( payload ) {
			const { exampath, email, cpf } = payload;
			try {
				const placeHoldedFile = await addSignaturePlaceholderToPdf( {
					//file: '/path/to/file.pdf',
					file: exampath,                   // Path to file, Required
					out: `/usr/share/exams/${cpf}signedExam.pdf`,                     // Output file path, Required
					estimatedsize: 30000,                        // Estimated signature size, Optional, Default is 30000
					certlevel: CertificationLevels.CertifiedFormFilling, // Certification level, Optional, Default is CertificationLevels.NotCertified
					//password: '123456',                          // Document password, Optional
					reason: "Laudo Médico de Exame",       // Signing reason, Optional, Default is undefined
					location: "Plataforma NexarXM™",                            // Signing location, Optional, Default is undefined
					contact: email,                         // Signing contact, Optional, Default is undefined
					date: moment().utc().format(),            // Signing date in ISO-8601 format, Optional, Default is undefined
				} );

				//Need to return
				//placeHoldedFile, medic, crm
				payload.placeHoldedFile = placeHoldedFile;
				return payload;
			} catch (error) {
				return null;
			}
		},

		// Returns the file with seal added to the PDF
		async embedSeal ( payload ) {
			const { placeHoldedFile, medic, crm } = payload;
			const { PDFDocument } = require( "pdf-lib" );
			moment.locale( "pt-br" );

			try {
				const pdfDoc = await PDFDocument.load( fs.readFileSync( placeHoldedFile ) );
				const pngImageBytes = fs.readFileSync("/usr/share/exams/templates/sign_template1.png" );
				const pngImage = await pdfDoc.embedPng( pngImageBytes );
				const pages = pdfDoc.getPages();
				const firstPage = pages[1];
				const imgW = firstPage.getWidth() / 3;
				const pngDims = pngImage.scale(1);// pngImage.scaleToFit(imgW, 200);
				firstPage.drawImage( pngImage, {
					x: firstPage.getWidth() / 2 - pngDims.width / 2,
					y: 25,//  firstPage.getHeight() - (pngDims.height + 25),
					width: pngDims.width,
					height: pngDims.height,
				} );
				firstPage.drawText( "Este documento foi assinado eletronicamente. ", {
					x: firstPage.getWidth() / 2 - ( pngDims.width / 2 - 125 ),
					y: ( pngDims.height / 2 )+50, size: 12,
				} );
				firstPage.drawText("Dr(a) " + medic, {x: firstPage.getWidth() / 2 - (pngDims.width/2 -125),y: ( pngDims.height / 2 )+40,size: 9,});
				firstPage.drawText("CRM " + crm, {x: firstPage.getWidth() / 2 - (pngDims.width/2 -125),y: ( pngDims.height / 2 )+30,size: 9,});
				firstPage.drawText("Data: " + moment().format("DD/MM/YYYY HH:mm:ss"), {x: firstPage.getWidth() / 2 - (pngDims.width/2 -125),y: ( pngDims.height / 2 ) +20 ,size: 9,});
				firstPage.drawText( "*Documento em Conformidade SBIS MP 2.200-2/2001", {
					x: firstPage.getWidth() / 2 - ( pngDims.width / 2 - 125 ),
					y: ( pngDims.height / 2 )+10, size: 7,
				} );
				fs.writeFileSync( placeHoldedFile, await pdfDoc.save() );

				//Need to return
				//id, patient_id, placeHoldedFile, signB64
				payload.placeHoldedFile = placeHoldedFile;
				return payload;

			} catch (error) {
				return error;
			}
		},

		// Returns the file path with signature added to the PDF
		async signDoc ( payload ) {
			try {
				const {id, patient_id, placeHoldedFile, signB64} = payload;
				const signedPath = await signPdf({
					file: placeHoldedFile,                   // Path to file, Required
					out: `/usr/share/exams/${id}_${patient_id}.pdf`,                     // Output file path, Required
					signature: signB64,                        // Base64-encoded external signature
				//password: '123456',                          // Document password, Optional
				} );
				payload.signedPath = signedPath;
				return payload;
			} catch (error) {
				return JSON.stringify(error);
			}
		}
	},
	created () { },
	started () { },
	stopped () { },
};
