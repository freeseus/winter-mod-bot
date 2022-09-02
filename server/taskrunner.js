var client, guild, query, scripts, util, self, developer_testing;


exports.t = {
	init: function (c, s) {
		client = c;
		scripts = s;
		guild = client.guilds.cache.find(g => g.name === scripts.guildname);
		developer_testing = guild.channels.cache.find(c => c.name === `developer_testing`);
		query = scripts.sql.query;
		util = scripts.util;

		self = this;
		self.intervalCount = 0;

		console.log(`\n`);
		setInterval(self.check, 1000);
	},
	check: async () => {
		let d = new Date();
		let daylightSavings = true; // March 14 - November 07, 2021 this should be true
		let noonHours = 17 - (daylightSavings ? 1 : 0);
		let fivepmHours = 22 - (daylightSavings ? 1 : 0);
		let isNoon = d.getHours() === noonHours && d.getMinutes() === 0; // every day at noon (GMT-5), check for promotions
		let isFivePM = d.getHours() === fivepmHours && d.getMinutes() === 0; // every day at 5pm (GMT-5), check for promotions
		let isNewDay = d.getHours() === 0 && d.getMinutes() === 0;
		let response; // set below

		if (!self.bootup) {
			self.bootup = true;
			//await self.tasks.updateEventsInDatabase(); // Update event data in test database
			//developer_testing.send({embeds: response.embed});
			await self.tasks.removeExpiredBans();
		}

		if (isNewDay && !self.newDayChecked) {
			self.newDayChecked = true;
		}

		if (self.intervalCount % 10 === 0) { // every 10 seconds, remove a point of exhaustion from winterbot
		}

		if (self.intervalCount % 60 === 0) { } // every minute
		if (self.intervalCount % (60 * 5) === 0) {
			if (!self.bootup) {
			}
		} // every 5 minutes

		if (self.intervalCount % (60 * 10) === 0) { // every 10 minutes, get events
		}

		if (self.intervalCount % (60 * 15) === 0) { } // every 15 minutes
		if (self.intervalCount % (60 * 30) === 0) { } // every 30 minutes
		if (self.intervalCount % (60 * 45) === 0) { } // every 45 minutes

		if (self.intervalCount % (60 * 60) === 0) { // every hour
			console.log(`:: task runner             : interval 1 hour`);
			self.intervalCount = 0; // every hour, reset intervalcount to 0
			await self.tasks.removeExpiredBans();
		}

		self.intervalCount++;
	},
	tasks: {
		removeExpiredBans: async function () {
			let bans = await new Promise((resolve) => {
				query(`SELECT * FROM \`ban-timeouts\` WHERE \`revoked\` = 0 AND \`expired\` = 0 AND \`expires\` <= NOW() AND \`revoked\` = 0`, (error, results, fields) => {
					if (error) {
						console.log(error);
					}
					resolve(results);
				});
			});


			console.log(bans.length);
			for (let i = 0; i < bans.length; i++) {
				let ban = bans[i];
				// get discord user
				let bannedMember = await client.users.fetch(ban.discorduid);
				let banned = false;

				// check if discord user has been deleted or bot is not able to detect
				if (bannedMember) {
					// check if ban is still recorded in discord
					console.log(`Checkign for ban: ${ban.member}`);
					try {
						await guild.bans.fetch(ban.discorduid);
						banned = true;
					} catch (error) {
						console.log(`${ban.member} was supposed to be un banned but was not banned!`);
					}

					if (banned) {
						guild.bans.remove(bannedMember, `ban expired`);
					}
					query(`UPDATE \`ban-timeouts\` SET \`expired\` = 1 WHERE \`id\` = '${ban.id}'`, (error, results, fields) => {
						if (error) {
							console.log(error);
						}
					});
				} else {
					console.log(`unable to remove ban due to not being able to find user: ${ban.member}`);
				}
			}
		},
	}
};