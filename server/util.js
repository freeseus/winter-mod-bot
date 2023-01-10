var c = {
	color: {
		accent: 0x37a0dc
	},
	array: {
		removeItem: function (item, array) {
			let index = array.indexOf(item);

			if (index > -1) {
				array.splice(index, 1);
			}

			return array;
		},
		sort: {
			byPropertyString: function (property, ignoreCase) {
				if (ignoreCase) {
					return function (a, b) {
						return a[property].toLowerCase().localeCompare(b[property].toLowerCase());
					};
				} else {
					return function (a, b) {
						return a[property].localeCompare(b[property]);
					};
				}
			}
		}
	},
	cookieGenerator: {
		int: function (int) {
			return Math.floor(Math.random() * (int || 25)); //randomly choose 0-99 if no int specified
		},
		letters: function (params) {
			let t = '', chars = '';

			if (!params || typeof (params) !== 'object') {
				params = { quantity: 1 };
				chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
			} else {
				if (!params.quantity || !Number(params.quantity)) {
					params.quantity = 1;
				}

				if (params.lowercase) {
					chars += 'abcdefghijklmnopqrstuvwxyz';
				}

				if (params.uppercase) {
					chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
				}
			}

			for (let i = 0; i < params.quantity; i++) {
				t += chars.charAt(c.cookieGenerator.int(chars.length));
			}

			return t;
		},
		numbers: function (params) {
			let t = '', chars = '1234567890';

			if (params && typeof (params) === 'number') {
				params = { quantity: params };
			} else if (!params || typeof (params) !== 'object') {
				params = { quantity: 1 };
			} else {
				if (!params.quantity || !Number(params.quantity)) {
					params.quantity = 1;
				}
			}

			for (let i = 0; i < params.quantity; i++) {
				t += chars.charAt(c.cookieGenerator.int(chars.length));
			}

			return t;
		},
		lettersAndNumbers: function (params) {
			let defaultQuantity = 5, t = '';

			if (params && typeof (params) === 'number') {
				params = { lowercase: true, uppercase: true, quantity: params };
			} else if (!params || typeof (params) !== 'object') {
				params = { lowercase: true, uppercase: true, quantity: defaultQuantity };
			} else {
				if (!params.quantity || !Number(params.quantity)) {
					params.quantity = defaultQuantity;
				}
			}

			for (var i = 0; i < params.quantity; i++) {
				let r = Math.floor(Math.random() * 2);

				if (r) {
					t += c.cookieGenerator.int(10);
				} else {
					t += c.cookieGenerator.letters({ lowercase: params.lowercase, uppercase: params.uppercase, quantity: 1 });
				}
			}

			return t;
		}
	},
	prettyDate: function (date, ignoreTime = false) {
		date = date || new Date();

		let y = date.getFullYear();
		let m = date.getMonth();
		m = m < 9 ? '0' + (m + 1) : (m + 1);
		let d = date.getDate();
		d = d < 10 ? '0' + d : d;
		let h = date.getHours();
		h = h > 12 ? h - 12 : h;
		let i = date.getMinutes();
		i = i < 10 ? '0' + i : i;
		let a = date.getHours() >= 12 ? 'PM' : 'AM';

		return y + '-' + m + '-' + d + (!ignoreTime ? (' ' + h + ':' + i + ' ' + a) : '');
	},
	getUserByProperty: function (a, property, value) {
		let o = {};

		for (let i = 0; i < a.length; i++) {
			if (a[i][property] === value) {
				o = a[i];
				break;
			}
		}

		return o;
	},
	getUserByDiscordtag: function (a, username, discriminator) {
		let o;

		for (let i = 0; i < a.length; i++) {
			if (String(a[i].username).toLowerCase() === username.toLowerCase() && a[i].discriminator === discriminator) {
				o = a[i];
				break;
			}
		}

		return o;
	},
	makeEmbed: function (obj) {
		if(typeof obj !== `object`){
			obj = {
				text: obj,
				footer: ``,
			};
		}
	
		let o = {
			color: obj.color || util.color.accent,
		};
		
		obj.title ? o.title = obj.title : 0;
		(obj.author && obj.author.name) ? o.author = {name: obj.author.name} : 0;
		(obj.author && !obj.author.name && obj.author.iconURL) ? o.author = {iconURL: obj.author.iconURL} : 0;
		(obj.author && obj.author.name && obj.author.iconURL) ? o.author.iconURL = obj.author.iconURL : 0;
		obj.thumbnail ? o.thumbnail = {url: obj.thumbnail} : 0;
		(obj.text || obj.description) ? o.description = (obj.text || obj.description) : 0;
		obj.img ? o.image = {url: obj.img} : 0;
		obj.footer ? o.footer = {text: obj.footer} : 0;
		(obj.footer && obj.footerImage) ? o.footer.iconURL = obj.footerImage : 0;
		(!obj.footer && obj.footerImage) ? o.footer = {iconURL: obj.footerImage} : 0;
		obj.fields ? o.fields = obj.fields : 0;
	
		return o;
	},
	getHostName: async function (id, scripts) {
		let query = scripts.sql.query;

		let member = await new Promise((resolve) => {
			query(`SELECT * FROM \`members-discord\` WHERE \`id\` = '${id}' LIMIT 1`, (error, results, fields) => {
				resolve(results && results[0] ? results[0] : { member: `Ex-member` });
			});
		});

		return member[`member`];
	},
	getHost: async function (id, query) {
		let member = await new Promise((resolve) => {
			query(`SELECT * FROM \`members-discord\` WHERE \`id\` = '${id}' LIMIT 1`, (error, results, fields) => {
				resolve(results && results[0] ? results[0] : { member: `Ex-member` });
			});
		});
		return member;
	},
	getHostFromDiscordUUID: async function (uuid, query) {
		let member = await new Promise((resolve) => {
			query(`SELECT * FROM \`members-discord\` WHERE \`discorduid\` = '${uuid}' LIMIT 1`, (error, results, fields) => {
				resolve(results && results[0] ? results[0] : { member: `Ex-member` });
			});
		});
		return member;
	},
	sleep: async function (millis) {
		return new Promise(resolve => setTimeout(resolve, millis));
	},
	string: {
		slugify: function (s) {
			s = s.replace(/[^\w\s#-]/gi, '').replace(/ /g, '_').replace(/-/g, '_').replace(/_+(?=)/g, '_');
			s = s.replace(/_/g, ' ').trim().replace(/ +(?= )/g, '').replace(/ /g, '_').substring(0, 15);
			return s;
		}
	},
	sort: {
		byPropertyBool: function (property) {
			return function (a, b) {
				return b[property] - a[property];
			};
		},
		byPropertyString: function (property, ignoreCase) {
			if (ignoreCase) {
				return function (a, b) {
					return a[property].toLowerCase().localeCompare(b[property].toLowerCase());
				};
			} else {
				return function (a, b) {
					return a[property].localeCompare(b[property]);
				};
			}
		},
		byPropertyValue: function (property) {
			return function (a, b) {
				return b[property] - a[property];
			};
		},
		byTwoPropertyValues: function (property, property2) {
			return function (a, b) {
				return b[property] - a[property] || a[property2].localeCompare(b[property2]);
			};
		},
		byPropertyValueThenPropertyBool: function (property, property2) {
			return function (a, b) {
				return b[property] - a[property] || b[property2] - a[property2];
			};
		},
		byPropertyValueThenPropertyString: function (property, property2) {
			return function (a, b) {
				return b[property] - a[property] || a[property2].toLowerCase().localeCompare(b[property2].toLowerCase());
			};
		},
		byPropertyValueThenPropertyStringUp: function (property, property2) {
			return function (a, b) {
				return b[property] - a[property] || b[property2].toLowerCase().localeCompare(a[property2].toLowerCase());
			};
		},
		byPropertyStringThenPropertyString: function (property, property2, ignoreCase) {
			if (ignoreCase) {
				return function (a, b) {
					return a[property].toLowerCase().localeCompare(b[property].toLowerCase()) || a[property2].toLowerCase().localeCompare(b[property2].toLowerCase());
				};
			} else {
				return function (a, b) {
					return a[property].localeCompare(b[property]) || a[property2].localeCompare(b[property2]);
				};
			}
		},
		byPropertyStringThenPropertyStringUp: function (property, property2, ignoreCase) {
			if (ignoreCase) {
				return function (a, b) {
					return a[property].toLowerCase().localeCompare(b[property].toLowerCase()) || b[property2].toLowerCase().localeCompare(a[property2].toLowerCase());
				};
			} else {
				return function (a, b) {
					return a[property].localeCompare(b[property]) || b[property2].localeCompare(a[property2]);
				};
			}
		}
	}
};

exports.util = c;
