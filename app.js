const util = require(`./server/util.js`).util;
const {Client, GatewayIntentBits} = discordjs;

const discordconfig = require(`${__dirname}/server/config/config.json`)[`discord`];
const socketconfig = require(`${__dirname}/server/config/config.json`)[`socket`];

const ranksinfo = require(`./server/infomaps/ranksinfo.js`).ranksinfo;

const conn = require(`./server/db/connection.js`).conn;
const query = require(`./server/db/query.js`).query;

const operator = require(`./server/operator.js`).operator;
const slashcommander = require(`./server/slashcommander.js`).slashcommander;

const myArgs = process.argv.slice(2);

let debugMode = myArgs.includes(`DEBUG`);
let debugLocalMode = myArgs.includes(`DEBUG`) && myArgs.includes(`LOCAL`);
let socketAddress = debugMode ? socketconfig[`debugPath`] : socketconfig[`path`];
let testserver = myArgs.includes(`TEST`);

if (debugMode && !debugLocalMode) {
	console.log(`:: DEBUG MODE ::`);
}else if (debugLocalMode) {
	console.log(`:: LOCAL DEBUG MODE ::`);
	socketAddress = socketconfig[`debugLocalPath`];
}

if (testserver) {
	console.log(`:: SELECTING TEST GUILD ::`);
}else{
	console.log(`:: SELECTING WINTER CLAN GUILD ::`);
}

const discord = {
	token: testserver ? discordconfig[`testservertoken`] : discordconfig[`winterclantoken`],
	client: new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildEmojisAndStickers,
			GatewayIntentBits.GuildBans,
			GatewayIntentBits.GuildIntegrations,
			GatewayIntentBits.GuildWebhooks,
			GatewayIntentBits.GuildInvites,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildPresences,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildMessageReactions,
			GatewayIntentBits.DirectMessages,
		]
	}),
};

const scripts = {
	sql: {
		conn: conn,
		query: query
	},
	connectionDate: util.prettyDate(),
	util: util,
	guildname: testserver ? discordconfig[`testservername`] : discordconfig[`guildname`],
	testmode: testserver,
	debugMode: debugMode,
	infomaps: {
		ranksinfo: ranksinfo,
	}
};

console.log(` `);
console.log(`:: node version            :`, process.version);
console.log(`:: app started at          :`, util.prettyDate());

const interactions = {
	databaseConnect: async () => {
		await new Promise(async (resolve) => conn.init().then(() => {
			scripts.sql.query = query.bind(scripts.sql.conn.connection) && query.execute;
			console.log(`:: database connected at   :`, util.prettyDate());
			resolve();
		}));
	},
	discordClientLogin: async () => {
		await new Promise(async (resolve) => discord.client.login(discord.token).then(resolve()));
		console.log(`:: discord connected at    :`, util.prettyDate());
	},
	discordClientReady: async () => {
		await new Promise(async (resolve) => discord.client.on(`ready`, () => resolve()));
		console.log(`:: discord client ready at :`, util.prettyDate());
	},
};


(async () => {
	console.log(` `);
	console.log(`:: node version            :`, process.version);
	console.log(`:: app started at          :`, util.prettyDate());

	// establish external service connections/interactions
	await interactions.discordClientLogin();
	await interactions.discordClientReady();
	await interactions.databaseConnect();

	// getting database info
	await ranksinfo.init(scripts);

	// bot configuration processes

	// initializing processes

	// initialize the event and command handlers
	operator.init(discord.client, scripts);
	slashcommander.init(discord.client, scripts, discord.token);
})();
