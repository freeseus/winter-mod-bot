var client, guild, query, responses, util;



const taskrunner = require(`./taskrunner.js`).t;
const interactioncreate = require(`./events/interactioncreate.js`).i;


exports.operator = {
	init: (c, scripts) => {
		client = c;
		guild = client.guilds.cache.find(g => g.name === scripts.guildname);
		responses = scripts.responses;
		util = scripts.util;
		query = scripts.sql.query;

		interactioncreate.init(c, scripts);
		taskrunner.init(c, scripts);
	}
};
