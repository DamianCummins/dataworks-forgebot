'use strict';

var ForgeBot = require('../lib/forgebot');
var https = require('https');

var token = process.env.BOT_API_KEY;
var dbPath = process.env.BOT_DB_PATH;
var name = process.env.BOT_NAME;

// get VCAP services
var bluemixHelperConfig = require("bluemix-helper-config");
var global = bluemixHelperConfig.global;
var vcapServices = bluemixHelperConfig.vcapServices;


var forgebot = new ForgeBot({
	token: token,
	dbPath: dbPath,
	name: name
});

forgebot.run();