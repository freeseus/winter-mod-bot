const cred = require(`${__dirname}/../config/config.json`)[`database`];

exports.conn = {
	init: function () {
		let self = this;
		let promise = new Promise((resolve, reject) => {
			self.connection = require(`mysql`).createPool({ // use createPool, not createConnection unless you want to get disconnected every 10 seconds
				host: cred[`database_host`],
				port: cred[`database_port`],
				user: cred[`database_user`],
				password: cred[`database_pass`],
				database: cred[`database_schema`]
			});

			self.connection.getConnection((error, connection) => {
				error ? reject(`:: MYSQL DB connection failure`) : resolve(true);
			});
		});

		return promise;
	},
	connection: {}
};