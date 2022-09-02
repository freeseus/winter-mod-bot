
var client, gamesinfo, guild, platformsinfo, query, ranksinfo, util, self;

exports.i = {
    name: `ban`,
    description: `ban a member of the clan`,
    type: 1,
    active: true,
    default_member_permissions: "0",
    inputfields: `member:period:reason`,
    options: [
        {
            name: `member`,
            description: `the member who will be banned`,
            type: 6,
            required: true,
        },
        {
            name: `period`,
            description: `the time period that the ban will last for`,
            type: 3,
            required: true,
            autocomplete: true,
        },
        {
            name: `deletedays`,
            description: `How many days do you want to delete the message histroy from?`,
            type: 4,
            min_value: 0,
            max_value: 7,
            value: 0,
            autocomplete: true,
            required: true,
        },
        {
            name: `reason`,
            description: `Reason for the ban`,
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
        let period = options.period;
        let target = options.member;
        let reason = options.reason;
        let daystodelete = options.deletedays;
        await self.f.respond(interaction, user, options, target, period, reason, daystodelete);
    },
    autocomplete: async (interaction, field) => {
        if (field.name === `period`) {
            let periods = self.f.getPeriodData();
            interaction.respond(periods);
        } else if (field.name === `deletedays`) {
            let days = [];

            for (let i = 0; i <= 7; i++) {
                if (i === 1) {
                    days.push({ name: `${i} Day`, value: i });
                } else {
                    days.push({ name: `${i} Days`, value: i });
                }
            }

            interaction.respond(days);
        }else if (field.name===`reason`) {
            let periods = self.f.getBanReasonSuggestions(field.value);
            interaction.respond(periods);
        }
    },
    f: {
        respond: async (interaction, user, options, target, period, reason, daystodelete) => {
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
            if (issuerdata.mgmt <= 4 && !issuerpermissiondata.permissions.includes(`ban`)) {
                let embed = [{
                    color: `#37a0dc`,
                    description: `You have to be a Legate or above to use this command.`,
                }];
    
                let message = {
                    embeds: embed,
                    ephemeral: true,
                };
                interaction.reply(message);
                return;
            }

            //check if issuers mgmt is higher then target
            /*if (issuerdata.mgmt <= memberdata.mgmt) {
                let embed = [{
                    color: `#37a0dc`,
                    description: `You cannot ban your superiors or those at the same ranks as you.`,
                }];
    
                let message = {
                    embeds: embed,
                    ephemeral: true,
                };
                interaction.reply(message);
                return;
            }
            */


            let v = ``;
            let token = util.cookieGenerator.lettersAndNumbers(6) + String(new Date().getTime()) + util.cookieGenerator.lettersAndNumbers(6);
            if (period === `permanent`) {
                v += `\`memberid\` = '${memberdata.id}', \`discorduid\` = "${target}", \`issued\` = NOW(), \`issuerid\` = '${issuerdata.id}', \`reason\` = "${reason.replaceAll(`"`, ``)}", \`mgmt\` = '${memberdata.mgmt}',
                \`rank\` = '${memberdata.rank}', \`member\` = "${memberdata.member}", \`appealtoken\` = "${token}"`;
            } else {
                v += `\`memberid\` = '${memberdata.id}', \`discorduid\` = "${target}", \`issued\` = NOW(), \`expires\` = ${period}, \`issuerid\` = '${issuerdata.id}', \`reason\` = "${reason.replaceAll(`"`, ``)}", \`mgmt\` = '${memberdata.mgmt}',
                \`rank\` = '${memberdata.rank}', \`member\` = "${memberdata.member}", \`appealtoken\` = "${token}"`;
            }
            await new Promise(async (resolve, reject) => {
                query(`INSERT INTO \`ban-timeouts\` SET ${v}`, (error, results, fields) => {
                    if (error) {
                        console.log(error);
                    }
                    resolve();
                });
            });

            let bandata = await new Promise(async (resolve, reject) => {
                query(`SELECT * FROM \`ban-timeouts\` WHERE \`memberid\` = '${memberdata.id}' AND \`issuerid\` = '${issuerdata.id}' AND \`revoked\` = 0`, (error, results, fields) => {
                    if (error) {
                        console.log(error);
                    }
                    resolve(results[0]);
                });
            });


            // Create log message
            let s = ``;

            if (bandata.expires) {
                s = `Member: <@${target}>\nReason: ${reason}\nIssuer: <@${issuerdata.discorduid}>\nExprires: <t:${new Date(bandata.expires / 1000).getTime()}:f>`;
            } else {
                s = `Member: <@${target}>\nReason: ${reason}\nIssuer: <@${issuerdata.discorduid}>\nExprires: N/A`;
            }


            let embed = [{
                color: `#37a0dc`,
                title: `Ban Info`,
                description: s,
            }];

            let message = {
                embeds: embed,
                ephemeral: true,
            };

            // Handle message to banned member
            let discordmember = client.users.cache.get(target);

            let link = `https://discord.gg/winterclan`;
            let s2 = bandata.expires ? `By: <@${issuerdata.discorduid}>\nReason: ${reason}\nExprires: <t:${new Date(bandata.expires / 1000).getTime()}:f>` : `By: <@${issuerdata.discorduid}>\nReason: ${reason}\nLink: ${link}`;

            let embedToMember = [{
                color: `#37a0dc`,
                title: `You have been banned from: Winter Clan`,
                thumbnail: {
                    "url": "https://winterclan.net/marketing/emblem_blue_smaller_v3.jpg"
                },
                description: s2,
            }];

            let messageToMember = {
                embeds: embedToMember,
                ephemeral: false,
            };

            //send ban message to member
            await discordmember.send(messageToMember);


            // Ban Member
            try {
                if (daystodelete) {
                    guild.members.ban(discordmember, {reason: reason, days: daystodelete});
                }else{
                    guild.members.ban(discordmember, {reason: reason});
                }
            }catch (error) {
                console.log(error);
            }

            interaction.reply(message);
        },
        getPeriodData: function () {
            let months3 = { name: `3 Months`, value: `DATE_ADD(NOW(), INTERVAL 3 MONTH)` };
            let months6 = { name: `6 Months`, value: `DATE_ADD(NOW(), INTERVAL 6 MONTH)` };
            let months9 = { name: `9 Months`, value: `DATE_ADD(NOW(), INTERVAL 9 MONTH)` };
            let year1 = { name: `1 Year`, value: `DATE_ADD(NOW(), INTERVAL 1 YEAR)` };
            let years20 = { name: `20 Years`, value: `DATE_ADD(NOW(), INTERVAL 20 YEAR)` };
            let permanent = { name: `Permanent`, value: `permanent` };
            let periods = [months3, months6, months9, year1, years20, permanent];
            return periods;
        },
        getBanReasonSuggestions: function(current) {
            let list = [];
            list = this.addBanReason(`Age-related`, current, list);
            list = this.addBanReason(`Hate speech`, current, list);
            list = this.addBanReason(`SFW policy violation`, current, list);
            list = this.addBanReason(`Multi-clanning`, current, list);
            list = this.addBanReason(`Poaching`, current, list);
            list = this.addBanReason(`Cheating`, current, list);
            list = this.addBanReason(`Violating EULA`, current, list);
            list = this.addBanReason(`Insubordination`, current, list);
            list = this.addBanReason(`"Forced vacation"`, current, list);
            list = this.addBanReason(`Predatory behavior`, current, list);
            list = this.addBanReason(`Harassment`, current, list);

            return list;
        },
        addBanReason: function(reason, current, list) {
            if (reason.toLowerCase().startsWith(current.toLowerCase())) {
                list.push({name: `${reason}`, value: `${reason}`});
            }
            return list;
        },
    },
};