var query, self;

exports.platformsinfo = {
	init: async function(scripts){
		query = scripts.sql.query;
		self = this;

		await self.getData();
	},
	getData: async () => {
		await new Promise(async (resolve) => {
			query(`SELECT * FROM \`platforms\` ORDER BY \`id\` DESC`, (error, results, fields) => {
				if(results && results.length){
					self.platforms.list = results;
					self.platforms.idMap = results.reduce((array, item) => ({...array, [item.id]: item}), {});
					self.platforms.nameMap = results.reduce((array, item) => ({...array, [item.platform]: item}), {});
					self.platforms.discordNameMap = results.reduce((array, item) => ({...array, [item.platdiscordlc.toLowerCase()]: item}), {});
					self.platforms.abbrevMap = results.reduce((array, item) => ({...array, [item.abbrev]: item}), {});
					
					self.platforms.interactionMap = ((a = []) => {
						let platformListABC = self.platforms.list.sort((a, b) => (a.platdiscordlc > b.platdiscordlc) ? 1 : -1);

						for(let i = 0; i < platformListABC.length; i++){
							a.push({
								name: platformListABC[i].platdiscordlc,
								value: platformListABC[i].abbrev,
							});
						}

						a.push({name: `Other/Discord`, value: `discord`});

						return a;
					})();
				}

				resolve();
			});
		});
	},
	platforms: {},
};