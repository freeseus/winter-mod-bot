var client, gamesinfo, guild, platformsinfo, query, ranksinfo, scripts, util, self;

exports.i = {
	init: function (c, s) {
		client = c;
		scripts = s;
		eventtypesinfo = scripts.infomaps.gamesinfo;
		gamesinfo = scripts.infomaps.gamesinfo;
		guild = client.guilds.cache.find(g => g.name === `Winter Clan`);
		platformsinfo = scripts.infomaps.platformsinfo;
		ranksinfo = scripts.infomaps.ranksinfo;
		query = scripts.sql.query;
		util = scripts.util;
		self = this;

		client.on(`interactionCreate`, self.event);
	},
	event: async (interaction) => {
		let channelGameId = await self.f.getGameIdForChannel(interaction.channel);

		if (interaction.isAutocomplete()) {
			let field = interaction.options.getFocused(true);
			if (interaction.commandName) {
				let command = client.commands.get(interaction.commandName);
				if (command.autocomplete) {
					await command.autocomplete(interaction, field);
				}
			}
		}

		if (interaction.isCommand()) {
			let command = client.commands.get(interaction.commandName);
			let options = {};

			for (let option of interaction.options.data) {
				if (option.type === `SUB_COMMAND`) {
					if (option.name) {
						options[option.name] = true;
					}

					option.options?.forEach((x) => {
						options[x.name] = x.value;
					});
				} else if (option.value) {
					options[option.name] = option.value;
				}
			}

			try {
				if (command.inputfields === `gameid:platformid`) {
					command.run(interaction, options, interaction.user, channelGameId, ``);
				} else if (command.inputfields === `gameid`) {
					command.run(interaction, options, interaction.user, channelGameId);
				}else{
					command.run(interaction, options, interaction.user);
				}
			} catch (error) {
				console.log(error);

				guild.members.cache.get(guild.ownerId).send({
					content: `${user.username} attempted to use the ${command.commandName} command and it errored.`,
				});

				return interaction.reply({
					content: `There was an error while executing this command! Please make <@${guild.ownerId}> aware of this issue.`,
					ephemeral: true,
				});
			}
		}

		if (interaction.isModalSubmit()) {
			let modal = require(`../modals/${interaction.customId}.js`).m;

			if (modal) {
				try {
					await modal.init(client, scripts, interaction, channelGameId);
				} catch (error) {
					console.log(error);

					return interaction.reply({
						content: `There was an error while executing this command! Please make <@${guild.ownerId}> aware of this issue.`,
						ephemeral: true,
					});
				}
			}
		}

	},
	f: {
		getGameIdForChannel: async (channel) => {
			let channelName = channel.name.toLowerCase().split(`_bot`).join(``) || ``;
			let channelNameNoGameSuffix = channelName.replace(/_[^_]+$/, ``);
			let channelGameId = ((id) => {
				for (let game of gamesinfo.games.list) {
					if (!game.stop && game.channel && channelNameNoGameSuffix && game.channel.includes(channelNameNoGameSuffix)) {
						id = game.id;
					}
				}

				return id;
			})();

			return channelGameId;
		},
	},
};
