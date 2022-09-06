
var client, gamesinfo, guild, platformsinfo, query, ranksinfo, util, self;

exports.i = {
    name: `kick`,
    description: `kick a member of the clan`,
    type: 1,
    active: true,
    default_member_permissions: "0",
    inputfields: `member:period:reason`,
    options: [
        {
            name: `member`,
            description: `the member who will be kicked`,
            type: 6,
            required: true,
        },
        {
            name: `reason`,
            description: `Reason for the kick`,
            type: 3,
            autocomplete: true,
            required: true,
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
        let target = options.member;
        let reason = options.reason;
        await self.f.respond(interaction, user, options, target, reason);
    },
    autocomplete: async (interaction, field) => {
        if (field.name === `reason`) {
            let periods = self.f.getKickReasonSuggestions(field.value);
            interaction.respond(periods);
        }
    },
    f: {
        respond: async (interaction, user, options, target, reason) => {
            let memberdata = await util.getHostFromDiscordUUID(target, query);
            let issuerdata = await util.getHostFromDiscordUUID(user.id, query);

            let issuerpermissiondata = await new Promise(async (resolve, reject) => {
                query(`SELECT * FROM \`moderation-permissions\` WHERE \`discorduid\` = "${user.id}"`, (error, results, fields) => {
                    if (error) {
                        console.log(error);
                    }
                    resolve(results && results[0] ? results[0] : { permissions: `` });
                });
            });

            // Check if issuer is legate or above if else send message and return.
            if (issuerdata.mgmt <= 3 && !issuerpermissiondata.permissions.includes(`kick`) && !issuerpermissiondata.permissions.includes(`admin`)) {
                let embed = [{
                    color: `#37a0dc`,
                    description: `You have to be a Marshal or above to use this command.`,
                }];

                let message = {
                    embeds: embed,
                    ephemeral: true,
                };
                interaction.reply(message);
                return;
            }

            //check if issuers mgmt is higher then target
            if (issuerdata.mgmt <= memberdata.mgmt && !issuerpermissiondata.permissions.includes(`admin`)) {
                let embed = [{
                    color: `#37a0dc`,
                    description: `You cannot kick your superiors or those at the same ranks as you.`,
                }];

                let message = {
                    embeds: embed,
                    ephemeral: true,
                };
                interaction.reply(message);
                return;
            }



            let v = `\`memberid\` = '${memberdata.id}', \`discorduid\` = "${target}", \`issued\` = NOW(), \`issuerid\` = '${issuerdata.id}', \`reason\` = "${reason.replaceAll(`"`, ``)}", \`mgmt\` = '${memberdata.mgmt}',
                \`rank\` = '${memberdata.rank}', \`member\` = "${memberdata.member}"`;

            await new Promise(async (resolve, reject) => {
                query(`INSERT INTO \`kick-logs\` SET ${v}`, (error, results, fields) => {
                    if (error) {
                        console.log(error);
                    }
                    resolve();
                });
            });

            let kickdata = await new Promise(async (resolve, reject) => {
                query(`SELECT * FROM \`kick-logs\` WHERE \`memberid\` = '${memberdata.id}' AND \`issuerid\` = '${issuerdata.id}' AND \`revoked\` = 0`, (error, results, fields) => {
                    if (error) {
                        console.log(error);
                    }
                    resolve(results[0]);
                });
            });


            // Create log message
            let s = `Member: <@${target}>\nReason: ${reason}\nIssuer: <@${issuerdata.discorduid}>`;


            let embed = [{
                color: `#37a0dc`,
                title: `Kick Info`,
                description: s,
            }];

            let message = {
                embeds: embed,
                ephemeral: true,
            };

            // Handle message to kicked member
            let discordmember = client.users.cache.get(target);

            let link = `https://discord.gg/winterclan`;
            let s2 = `By: <@${issuerdata.discorduid}>\nReason: ${reason}\nLink: ${link}`;

            let embedToMember = [{
                color: `#37a0dc`,
                title: `You have been kicked from: Winter Clan`,
                thumbnail: {
                    "url": "https://winterclan.net/marketing/emblem_blue_smaller_v3.jpg"
                },
                description: s2,
            }];

            let messageToMember = {
                embeds: embedToMember,
                ephemeral: false,
            };

            //send kick message to member
            await discordmember.send(messageToMember);


            // kick Member
            try {
                guild.members.kick(discordmember, { reason: reason });
            } catch (error) {
                console.log(error);
            }

            interaction.reply(message);
        },
        getKickReasonSuggestions: function (current) {
            let list = [];
            list = this.addKickReason(`Age-related`, current, list);
            list = this.addKickReason(`Hate speech`, current, list);
            list = this.addKickReason(`SFW policy violation`, current, list);
            list = this.addKickReason(`Multi-clanning`, current, list);
            list = this.addKickReason(`Poaching`, current, list);
            list = this.addKickReason(`Cheating`, current, list);
            list = this.addKickReason(`Violating EULA`, current, list);
            list = this.addKickReason(`Insubordination`, current, list);
            list = this.addKickReason(`"Forced vacation"`, current, list);
            list = this.addKickReason(`Predatory behavior`, current, list);
            list = this.addKickReason(`Harassment`, current, list);

            return list;
        },
        addKickReason: function (reason, current, list) {
            if (reason.toLowerCase().startsWith(current.toLowerCase())) {
                list.push({ name: `${reason}`, value: `${reason}` });
            }
            return list;
        },
    },
};