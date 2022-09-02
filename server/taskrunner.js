var client, guild, query, scripts, util, self, developer_testing;


exports.t = {
	init: function(c, s){
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

		if(!self.bootup){
			self.bootup = true;
			//await self.tasks.updateEventsInDatabase(); // Update event data in test database
			//developer_testing.send({embeds: response.embed});
		}

		if(isNewDay && !self.newDayChecked){
			self.newDayChecked = true;
		}

		if(self.intervalCount % 10 === 0){ // every 10 seconds, remove a point of exhaustion from winterbot
		}

		if(self.intervalCount % 60 === 0){} // every minute
		if(self.intervalCount % (60 * 5) === 0){
			if (!self.bootup) {
			}
		} // every 5 minutes

		if(self.intervalCount % (60 * 10) === 0){ // every 10 minutes, get events
		}

		if(self.intervalCount % (60 * 15) === 0){} // every 15 minutes
		if(self.intervalCount % (60 * 30) === 0){} // every 30 minutes
		if(self.intervalCount % (60 * 45) === 0){} // every 45 minutes

		if(self.intervalCount % (60 * 60) === 0){ // every hour
			console.log(`:: task runner             : interval 1 hour`);
			self.intervalCount = 0; // every hour, reset intervalcount to 0
		}

		self.intervalCount++;
	},
	tasks: {
	}
};