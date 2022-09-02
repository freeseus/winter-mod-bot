var query, self;

exports.ranksinfo = {
	init: async function(scripts){
		query = scripts.sql.query;
		self = this;

		await self.getData();
	},
	getData: async () => {
		await new Promise(async (resolve, reject) => {
			query(`SELECT * FROM \`weight-rank\``, (error, results, fields) => {
				self.nrml.nameMap = results.reduce((array, item) => ({...array, [item.rank]: item}), {}); // prospect: {rank: prospect, weight: 1} etc
				self.nrml.weightMap = results.reduce((array, item) => ({...array, [item.weight]: item}), {}); // 1: {rank: prospect, weight: 1} etc
				resolve();
			});
		});

		await new Promise(async (resolve, reject) => {
			query(`SELECT * FROM \`weight-mgmt\``, (error, results, fields) => {
				self.mgmt.nameMap = results.reduce((array, item) => ({...array, [item.rank]: item}), {}); // founder: {rank: founder, weight: 6} etc
				self.mgmt.weightMap = results.reduce((array, item) => ({...array, [item.weight]: item}), {}); // 6: {rank: founder, weight: 6} etc
				resolve();
			});
		});
	},
	mgmt: {}, // leadership
	nrml: {}, // non-leadership
};
