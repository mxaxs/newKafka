(function(callback) {
	"use strict";

	const httpTransport = require("http");
	const responseEncoding = "utf8";
	const httpOptions = {
		hostname: "localhost",
		port: "80",
		path: "/api/file/upload",
		method: "POST",
		headers: {"Content-Type":"application/pdf"}
	};
	httpOptions.headers["User-Agent"] = "node " + process.version;

	// Paw Store Cookies option is not supported

	const request = httpTransport.request(httpOptions, (res) => {
		let responseBufs = [];
		let responseStr = "";

		res.on("data", (chunk) => {
			if (Buffer.isBuffer(chunk)) {
				responseBufs.push(chunk);
			}
			else {
				responseStr = responseStr + chunk;
			}
		}).on("end", () => {
			responseStr = responseBufs.length > 0 ?
				Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;

			callback(null, res.statusCode, res.headers, responseStr);
		});

	})
		.setTimeout(0)
		.on("error", (error) => {
			callback(error);
		});
	request.write(undefined);
	request.end();


})((error, statusCode, headers, body) => {
	console.log("ERROR:", error);
	console.log("STATUS:", statusCode);
	console.log("HEADERS:", JSON.stringify(headers));
	console.log("BODY:", body);
});
