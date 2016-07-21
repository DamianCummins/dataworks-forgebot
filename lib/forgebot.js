'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');
var dataworks = require('./dataworks/lib/dataload/dataworks.js');

var ForgeBot = function Constructor(settings){
	this.settings = settings;
	this.settings.name = this.settings.name || 'forgebot';
	this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'forgebot.db');

	this.user = null;
	this.db = null;
};

// inherits methods and properties from the Bot constructor
util.inherits(ForgeBot, Bot);

module.exports = ForgeBot;

ForgeBot.prototype.run = function(){
	ForgeBot.super_.call(this, this.settings);

	this.on('start', this._onStart);
	this.on('message', this._onMessage);
};


ForgeBot.prototype._onStart = function(){
	this._loadBotUser();
	this._connectDb();
	this._firstRunCheck();
};

ForgeBot.prototype._loadBotUser = function(){
	var self = this;
	this.user = this.users.filter(function(user){
		return user.name === self.name;
	})[0];
};

ForgeBot.prototype._connectDb = function(){
	if(!fs.existsSync(this.dbPath)){
		console.error('Database path ' + '"' + this.dbPath + '" does not exists or it\'s not readable.');
		process.exit(1);
	}

	this.db = new SQLite.Database(this.dbPath);
};

ForgeBot.prototype._firstRunCheck = function(){
	var self = this;
	self.db.get('SELECT val FROM info WHERE name = "lastrun" LIMIT 1', function(err, record){
		if (err) {
			return console.error('DATABASE ERROR:', err);
		}

		var currentTime = (new Date()).toJSON();

		// this is a first run
		if (!record) {
			self._welcomeMessage();
			return self.db.run('INSERT INTO info(name, val) VALUES("lastrun", ?)', currentTime);
		}

		// update with new last running time
		self.db.run('UPDATE info SET val = ? WHERE name = "lastrun"', currentTime);
	});
};


ForgeBot.prototype._welcomeMessage = function(){
	this.postMessageToChannel(this.channels[0].name, 'Hi guys, roundhouse-kick anyone?' +
        '\n I can tell jokes, but very honest ones. Just say `Chuck Norris` or `' + this.name + '` to invoke me!',
        {as_user: true});
};


ForgeBot.prototype._onMessage = function(message){
	if(this._isChatMessage(message) &&
		this._isChannelConversation(message) &&
		!this._isFromForgeBot(message) &&
		this._isMentioningForgeBot(message)) {
			if(this._isListActivities(message)){
				this._listActivities(message);
			} else {
				this._replyWithRandomJoke(message);
			}
	}
};

ForgeBot.prototype._isChatMessage = function(message){
	return message.type === 'message' && Boolean(message.text);
};

ForgeBot.prototype._isChannelConversation = function(message){
	return typeof message.channel === 'string' &&
		message.channel[0] === 'C';
};

ForgeBot.prototype._isFromForgeBot = function(message){
	return message.user === this.user.id;
};

ForgeBot.prototype._isMentioningForgeBot = function(message){
	return message.text.toLowerCase().indexOf('forgebot') > -1 ||
		message.text.toLowerCase().indexOf(this.name) > -1;
};

ForgeBot.prototype._isListActivities = function(message){
	return message.text.toLowerCase().indexOf('list activities') > -1;
};

ForgeBot.prototype._replyWithRandomJoke = function(originalMessage){
	var self = this;
	self.db.get('SELECT id, joke FROM jokes ORDER BY used ASC, RANDOM() LIMIT 1', function(err, record){
		if(err){
			return console.error('DATABASE ERROR:', err);
		}

		var channel = self._getChannelById(originalMessage.channel);
		self.postMessageToChannel(channel.name, record.joke, {as_user:true});
		self.db.run('UPDATE jokes SET used = used + 1 WHERE id = ?', record.id);
	});
};

ForgeBot.prototype._getChannelById = function(channelId){
	return this.channels.filter(function(item){
		return item.id === channelId;
	})[0];
};

ForgeBot.prototype._listActivities = function(originalMessage){
	var self = this;
	var dwInstance = new dataworks();
	dwInstance.listActivities(function(err, list){
		if(err){
			var channel = self._getChannelById(originalMessage.channel);
			self.postMessageToChannel(channel.name, err, {as_user:true});
		}		

		var channel = self._getChannelById(originalMessage.channel);
		self.postMessageToChannel(channel.name, list, {as_user:true});
	});
};