var client, gamesinfo, guild, platformsinfo, query, ranksinfo, util, self;

exports.i = {
    name: `records`,
    description: `ban a member of the clan`,
    type: 1,
    active: true,
    default_member_permissions: "0",
    inputfields: ``,
    options: [
        {
            name: `bans`,
            description: `look up a specific active ban`,
            type: 1,
            options: [
                {
                    name: `name`,
                    description: `name to use to search for?`,
                    type: 3,
                    required: true,
                },
                {
                    name: `active`,
                    description: `is ban active`,
                    type: 5,
                    required: true,
                },
            ],
        },
    ],
    init: async function (c, scripts) {
        client = c;
        eventtypesinfo = scripts.infomaps.gamesinfo;
        gamesinfo = scripts.infomaps.gamesinfo;
        guild = client.guilds.cache.find(g => g.name === scripts.guildname);
        platformsinfo = scripts.infomaps.platformsinfo;
        ranksinfo = scripts.infomaps.ranksinfo;
        query = scripts.sql.query;
        util = scripts.util;
        self = this;
    },
    run: async (interaction, options, user) => {
        console.log(JSON.stringify(options));
        await self.f.respond(interaction, user, options);
        if (options.bans) {
            await self.f.banlookup(interaction, user, options, options.name, options.active);
        }
    },
    autocomplete: async (interaction, field) => {

    },
    f: {
        respond: async (interaction, user, options) => {
        },
        banlookup: async (interaction, user, options, name, active) => {
            let bandata = await new Promise(async (resolve, reject) => {
                if (active) {
                    query(`SELECT * FROM \`ban-timeouts\` WHERE \`member\` LIKE "%${name}%" AND \`revoked\` = 0 AND \`expired\` = 0 LIMIT 5`, (error, results, fields) => {
                        if (error) {
                            console.log(error);
                        }
                        resolve(results);
                    });
                } else {
                    query(`SELECT * FROM \`ban-timeouts\` WHERE \`member\` LIKE "%${name}%" LIMIT 5`, (error, results, fields) => {
                        if (error) {
                            console.log(error);
                        }
                        resolve(results);
                    });
                }

            });

            if (bandata.length > 0) {
                let i = 1;
                let first = true;
                for (let row of bandata) {
                    let issuer = await util.getHost(row.issuerid, query);
                    let s = `Member: <@${row.discorduid}>\nReason: ${row.reason}\nIssuer: <@${issuer.discorduid}>\nExprires: <t:${new Date(row.expires / 1000).getTime()}:f>`;

                    let embed = [{
                        color: `#37a0dc`,
                        title: `Ban Info: ${i} / ${bandata.length}`,
                        description: s,
                        footer: { text: `Ban id: ${row.id}` },
                    }];


                    let buttons = [{
                        type: 1,
                        components: [{
                            type: 2,
                            customId: `revoke`,
                            label: `Revoke`,
                            style: 3,
                        }],
                    }];

                    let message = {
                        embeds: embed,
                        components: buttons,
                        ephemeral: false,
                        fetchReply: true,
                    };

                    let msg;
                    if (first) {
                        msg = await interaction.reply(message);
                    }else{
                        msg = await interaction.followUp(message);
                    }
                    const filter = (interaction) => interaction.customId === 'revoke';
                    let collector = await msg.createMessageComponentCollector({ filter, time: 15_000, max: 1 });
                    collector.on(`collect`, async (interaction) => {
                        if (interaction.customId === `revoke`) {
                            query(`UPDATE \`ban-timeouts\` SET \`revoked\` = 1 WHERE \`id\` = ${row.id}`);
                        }
                    });

                    collector.on(`end`, async (collected) => {
                        msg.edit({ components: [] });
                    });

                    i++;
                    first = false;
                }
            } else {
                let embed = [{
                    color: `#37a0dc`,
                    description: `No bans found matching search parameters`,
                }];


                let message = {
                    embeds: embed,
                    ephemeral: true,
                };

                interaction.reply(message);

            }

        }

    },
};