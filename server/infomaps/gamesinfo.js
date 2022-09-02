var query, self;

exports.gamesinfo = {
	init: async function(scripts){
		query = scripts.sql.query;
		self = this;

		await self.getData();
	},
	getData: async () => {
		await new Promise(async (resolve) => {
			query(`SELECT * FROM \`games\` ORDER BY \`id\` DESC`, (error, results, fields) => {
				if(results && results.length){
					self.games.list = results;
					self.games.listByName = results.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
					self.games.idMap = results.reduce((array, item) => ({...array, [item.id]: item}), {});
					self.games.abbrevMap = results.reduce((array, item) => ({...array, [item.game]: item}), {});
					self.games.channelMap = results.reduce((array, item) => ({...array, [item.channel]: item}), {});
					self.games.emojiMap = results.reduce((array, item) => ({...array, [item.emoji]: item}), {});
					self.games.nameMap = results.reduce((array, item) => ({...array, [item.name]: item}), {});
					self.games.roleMap = results.reduce((array, item) => ({...array, [item.roletag]: item}), {});

					// this isn't being used yet
					// self.games.announcementsChannelMap = results.reduce((array, item) => ({...array, [item.pinchannel]: item}), {});
				}

				resolve();
			});
		});
	},
	games: {},
};