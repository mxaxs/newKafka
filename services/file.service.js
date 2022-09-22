const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const crypto = require( "crypto" );
const { PDFDocument } = require( "pdf-lib" );
const sizeOf = require( "image-size" );
let Jimp = require( "jimp" );
const mime = require("mime-types");
const pdf = require("pdf-parse");

module.exports = {
	name: "file",
	channels: {
		"file.upload": {
			group: "file",
			async handler ( payload ) {
				console.log( ">>> file.upload <<<", payload );
			},
		},
	},
	actions: {
		save: {
			timeout: 20*1000,
			handler(ctx) {
				return new this.Promise((resolve, reject) => {
					//reject(new Error("Disk out of space"));
					const uid = uuidv4();
					let pdfText = "no text";
					const originalExtension = path.extname(ctx.meta.filename);
					ctx.meta.filename = uid + path.extname(ctx.meta.filename);
					const filePath = path.join("/usr/share/exams", ctx.meta.filename || this.randomName());
					const f = fs.createWriteStream(filePath);
					f.on( "close", async () => {

						ctx.meta.examid = uid;
						// File written successfully
						if ( ctx.meta.mimetype != "application/pdf" ) {
							try {
								let objFile = await this.embedImage( filePath, uid, originalExtension );
								this.broker.sendToChannel( "file.uploaded", JSON.stringify(objFile) );
								resolve ( objFile );
							} catch ( error ) {
								console.log( "ERROR >>>>", error );
								reject( error );
							}
						} else {
							const docBuffer = fs.readFileSync( filePath );
							const hashSum = crypto.createHash("sha256");
							hashSum.update(docBuffer);
							const hex = hashSum.digest( "hex" );

							pdf( docBuffer ).then( async ( data ) => {
								pdfText = data.text;
								let objFile = {
									id: uid,
									uploadPath: filePath,
									downloadPath: "https://api-rest.in/exams/" + ctx.meta.filename,
									originalName: ctx.meta.filename,
									hash: hex,
									textexam: pdfText,
								};

								this.broker.sendToChannel( "file.uploaded", objFile  );
								resolve( objFile );
							});
						}
						//resolve( { id: uid, exampath: "https://api-rest.in/exams/" + uid + ".pdf", textexam: "no text" } );
						//resolve({ filePath, meta: ctx.meta });
					});

					ctx.params.on("error", err => {
						this.logger.info( "File error received", err.message );
						this.broker.sendToChannel("file.uploaded", JSON.stringify({ error: err.message }));
						reject(err);

						// Destroy the local file
						f.destroy(err);
					});

					f.on("error", () => {
						// Remove the errored file.
						fs.unlinkSync(filePath);
					});

					ctx.params.pipe( f );
				});
			}
		},
		delete: {
			rest: {
				method: "DELETE",
				path: "/delete"
			},
			params: {
				id: "string"
			},
			handler ( ctx ) {
				const filePath = path.join( "/usr/share/exams", ctx.params.id + ".pdf" );
				console.log( "filePath >>>>>>> \n", filePath );
				return new this.Promise((resolve, reject) => {
					fs.unlink( filePath, ( err ) => {
						if ( err ) {
							reject( err );
						} else {
							resolve( "File deleted successfully" );
						}
					});
				});
			}
		}
	},
	methods: {
		async  embedImage ( uploadPath, uid, ext ) {
			const newUploadPath = "/usr/share/exams/" + uid + ".pdf";
			const downloadPath = "https://api-rest.in/exams/" + uid + ".pdf";

			try {
				const imgBuffer = fs.readFileSync( uploadPath );
				const dimensions = sizeOf(uploadPath);
				const imgDims = await Jimp.read( imgBuffer );
				const imgW = imgDims.bitmap.width + 100;
				const imgH = imgDims.bitmap.height + 100;

				const document = await PDFDocument.create();
				//const page = document.addPage([imgW, imgH]);
				const page = document.addPage([dimensions.width+10, dimensions.height +10]);

				let img;
				if ( ext == ".png" ) {
					img = await document.embedPng(imgBuffer);
				} else {
					img = await document.embedJpg(imgBuffer);
				}
				const { width, height } = img.scale(1);
				page.drawImage(img, {
					x: page.getWidth() / 2 - width / 2,
					y: page.getHeight() / 2 - height / 2,
				} );
				fs.writeFileSync( newUploadPath, await document.save() );

				//generare hash after embed image
				const docBuffer = fs.readFileSync( newUploadPath );
				const hashSum = crypto.createHash("sha256");
				hashSum.update(docBuffer);
				const hex = hashSum.digest("hex");

				fs.unlink(uploadPath, function (err) {
					if (err) throw err;
					// if no error, file has been deleted successfully
					console.log("File deleted!");
				});
				return {id: uid, uploadPath: newUploadPath, downloadPath: downloadPath, hash: hex};
			} catch ( error ) {
				return error;
			}
		},
		changeExt(fileName, newExt) {
			let pos = fileName.includes(".") ? fileName.lastIndexOf(".") : fileName.length;
			let fileRoot = fileName.substr(0, pos);
			let output = `${fileRoot}.${newExt}`;
			return output;
		}
	}
};
