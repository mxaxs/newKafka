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
	actions: {
		upload: {
			rest: {
				method: "POST",
				path: "/upload"
			},
			async handler ( ctx ) {

				console.log("params", ctx);
				console.log("context.meta.$multipart", ctx.meta.$multipart);

				let sampleFile;
				let uploadPath;
				let extension;
				let downloadPath;
				const uid = uuidv4();
				let pdfText = "no text";
				if ( !ctx.files || Object.keys( ctx.files ).length === 0 ) {
					console.log( JSON.stringify( ctx ) );
					return JSON.stringify(ctx.files);
				}
				console.log( `Uploading file ${ctx.files}` );
				try {
					sampleFile = ctx.files.sampleFile;
					extension = path.extname(sampleFile.name);
					uploadPath = "/usr/share/exams/" + uid + extension;
					downloadPath = "https://api-rest.in/exams/" + uid + extension;

					sampleFile.mv( uploadPath, function ( err ) {
						if (err) return err;
						if(extension.toLowerCase() == ".pdf") {
							try {
								let dataBuffer = fs.readFileSync(uploadPath);
								const hashSum = crypto.createHash("sha256");
								hashSum.update(dataBuffer);
								const hex = hashSum.digest("hex");

								pdf(dataBuffer).then(function(data) {
									return JSON.stringify({id:uid, exampath: downloadPath, textexam: data.text, hash:hex });
								});
							} catch (error) {
								JSON.stringify({id:uid, exampath: downloadPath, textexam: error });
							}
						} else {
							this.embedImage(uploadPath, uid, extension ).then( ( paths ) => {
								JSON.stringify( { id: uid, exampath: paths.downloadPath, textexam: pdfText, hash:paths.hash } );
							});


						}
					});
				} catch (error) {
					console.log( "UPLOAD ERROR >>>>", error );
				}
			}
		},
		save: {
			handler(ctx) {
				this.logger.info("Received upload $params:", ctx.meta);
				return new this.Promise((resolve, reject) => {
					//reject(new Error("Disk out of space"));
					const filePath = path.join("/usr/share/exams", ctx.meta.filename || this.randomName());
					const f = fs.createWriteStream(filePath);
					f.on("close", () => {
						// File written successfully
						console.log("<<<<<< THE META >>>>>>", ctx.meta);
						this.logger.info(`Uploaded file stored in '${filePath}'`);
						resolve({ filePath, meta: ctx.meta });
					});

					ctx.params.on("error", err => {
						this.logger.info("File error received", err.message);
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
		}
	},
	methods: {
		async  embedImage ( uploadPath, uid, ext ) {
			const newUploadPath = "/usr/share/exams/" + uid + ".pdf";
			const downloadPath = "https://api-rest.in/exams/" + uid + ".pdf";

			try {
				const dimensions = sizeOf(uploadPath);
				const imgBuffer = fs.readFileSync( uploadPath );
				const hashSum = crypto.createHash("sha256");
				hashSum.update(imgBuffer);
				const hex = hashSum.digest("hex");

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
				console.log( "THE UPLOAD-PATH >>>>", uploadPath );
				fs.unlink(uploadPath, function (err) {
					if (err) throw err;
					// if no error, file has been deleted successfully
					console.log("File deleted!");
				});
				return {uploadPath: newUploadPath, downloadPath: downloadPath, hash:hex};
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
