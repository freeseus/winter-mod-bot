var client, discordtoken, gamesinfo, guild, platformsinfo, query, ranksinfo, util, self;

const {REST} = require(`@discordjs/rest`);
const {Routes} = require(`discord-api-types/v10`);
const {Collection} = require(`discord.js`);
const fs = require(`fs`);

exports.slashcommander = {
	init: async function(c, scripts, token){
		client = c;
		discordtoken = token;
		guild = client.guilds.cache.find(g => g.name === scripts.guildname);
		ranksinfo = scripts.infomaps.ranksinfo;
		query = scripts.sql.query;
		util = scripts.util;
		self = this;

		await self.slashCommands(c, scripts);
		//await self.addPerms(c, scripts);
	},
	slashCommands: async (c, scripts) => {
		client.commands = new Collection();

		let rest = new REST({ version: `10`}).setToken(discordtoken);
		let commandFiles = fs.readdirSync(`${__dirname}/slashcommands`).filter(file => file.endsWith(`.js`));

		let commands = await (async (arrayOfCommands = []) => {
				for(let commandFile of commandFiles){
					const command = require(`${__dirname}/slashcommands/${commandFile}`).i;
					
					if(command.active && command.active !== undefined){
						await command.init(client, scripts);
						arrayOfCommands.push(command);
						client.commands.set(command.name, command);
					}else if (command.active === undefined) {
						console.error(`${command.name} does not have an active variable`);
					}
				}
	
				return arrayOfCommands;
			})();

		let status = await (async (slashCommandStatus = `failed`) => {
			try{
				let applicationGuildCommands = Routes.applicationGuildCommands(client.user.id, guild.id);
				await rest.put(applicationGuildCommands, {body: commands});
				slashCommandStatus = `active`;
			}catch (error){
				console.error(error);
			}
	
			return slashCommandStatus;
		})();

		console.log(`:: slash commands          :`, status);
	},
	addPerms: async (c, scripts) => {
		let rest = new REST({ version: `10`}).setToken(discordtoken);
		let applicationGuildCommands = Routes.applicationGuildCommands(client.user.id, guild.id);
		let response = await rest.get(applicationGuildCommands);
		
		let permissions = new Collection();

		let banCmdID;

		for (let cmd of response) {
			console.log(cmd.name);
			if (cmd.name===`ban`) {
				banCmdID = cmd.id;
			}
		}

		let perms = new Collection();
		perms.set(banCmdID, {id: 743780536232837162, type: 1, permission: true});
		let applicationGuildCommandsPermissions = Routes.applicationCommandPermissions(client.user.id, guild.id, banCmdID);
		console.log(await rest.get(applicationGuildCommandsPermissions));
		try {
			await rest.put(applicationGuildCommandsPermissions, {body: {json: perms}});
		}catch(error) {
			console.log(error);
		}

		console.log(banCmdID);
	},
};