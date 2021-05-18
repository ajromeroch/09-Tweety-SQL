const { Client } = require("pg");
var postgresUrl = "postgres://localhost/tweetydb";

const client = new Client({
	connectionString: postgresUrl,
});

client.connect((err) => {
	if (err) {
		console.log("Connection error", err.stack);
	} else {
		console.log("DB connected");
	}
});

module.exports = client;
