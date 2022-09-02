var query, self;

exports.eventtypesinfo = {
	init: async function(scripts){
		query = scripts.sql.query;
		self = this;

		await self.getData();
	},
	getData: async () => {
		await new Promise(async (resolve, reject) => {
			query(`SELECT * FROM \`eventtypes\` ORDER BY \`id\` DESC`, (error, results, fields) => {
				if(results && results.length){
					self.eventTypes.list = results;
					self.eventTypes.typeMap = results.reduce((array, item) => ({...array, [item.type]: item}), {});
				}

				resolve();
			});
		});
	},
	eventTypes: {},
};
