'use strict';

var util = require('util');
var path = require('path');
var fs = require('fs');
var SQLite = require('sqlite3').verbose();
var Bot = require('slackbots');
var dataworks = require('nodejs-dataworks').dataload;
var dwInstance = null;

var ForgeBot = function Constructor(settings){
	this.settings = settings;
	this.settings.name = this.settings.name || 'forgebot';
	this.dbPath = settings.dbPath || path.resolve(process.cwd(), 'data', 'forgebot.db');

	this.user = null;
	this.db = null;

	dwInstance = new dataworks();
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
			if(this._isUsage(message)){
				this._printUsage(message);
			} else if(this._isListActivities(message)){
				this._listActivities(message, this._isListActivitiesInFull(message));
			} else if(this._isRunActivity(message)){
				this._runActivity(message, this._isRunActivityByName(message));
			} else if (this._isGetStatusMessage(message)){
				this._getActivityRunStatus(message, this._isGetStatusMessageNamed(message));	
			} else {
				this._replyWithRandomJoke(message);
			}
	}
};

ForgeBot.prototype._printUsage = function(originalMessage){
	var self = this;
	var usage = "*Forgebot Commands:*\n" +
	"&gt;&gt;&gt;Forgebot list activities\n" +
	"Forgebot list activities -v\n" + 
	"Forgebot run activity <activityId>\n" +
	"Forgebot run activity -n <activityName>\n" +
	"Forgebot get status -a <activityId> -r <runId>\n" +
	"Forgebot get status -a <activityId> -r latest\n" +
	"Forgebot get status -a -n <activityName> -r latest";
	var channel = self._getChannelById(originalMessage.channel);
	self.postMessageToChannel(channel.name, usage, {as_user:true});
};

ForgeBot.prototype._isUsage = function(message){
	return (message.text.toLowerCase().indexOf('help') > -1) ||
	(message.text.toLowerCase().indexOf('usage') > -1) ||
	(message.text.toLowerCase().indexOf('commands') > -1) ;
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

ForgeBot.prototype._isListActivitiesInFull = function(message){
	return message.text.toLowerCase().indexOf('list activities -v') > -1;
};

ForgeBot.prototype._isRunActivity = function(message){
	return message.text.toLowerCase().indexOf('run activity') > -1;
};

ForgeBot.prototype._isRunActivityByName = function(message){
	return message.text.toLowerCase().indexOf('run activity -n') > -1;
};

ForgeBot.prototype._isGetStatusMessage = function(message){
	return message.text.toLowerCase().indexOf('get status -a') > -1;
};

ForgeBot.prototype._isGetStatusMessageNamed = function(message){
	return message.text.toLowerCase().indexOf('get status -a -n') > -1;
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

ForgeBot.prototype._listActivities = function(originalMessage, inFull){
	var self = this;
	dwInstance.listActivities(function(err, list){
		if(err){
			var channel = self._getChannelById(originalMessage.channel);
			self.postMessageToChannel(channel.name, err, {as_user:true});
		}		

		var channel = self._getChannelById(originalMessage.channel);

		if(!inFull){
			var response = [];

			list.forEach(function(activity){
				var activityResponse = {};
				activityResponse.id = activity.id;
				activityResponse.name = activity.name;
				activityResponse.createdTimeStamp = activity.createdTimeStamp;
				activityResponse.createdByServiceType = activity.createdByServiceType;
				response.push(activityResponse);
			});

			self.postMessageToChannel(channel.name, JSON.stringify(response, null, 2), {as_user:true});
		} else {
			self.postMessageToChannel(channel.name, JSON.stringify(list, null, 2), {as_user:true});
		}
	});
};

ForgeBot.prototype._runActivity = function(originalMessage, byName){
	var self = this;
	var tokens = originalMessage.text.split(" ");
	var activityId = null;
	var activityName = null;
	if(!byName){
		var runIndex = tokens.indexOf("-r");
		if(tokens[runIndex+1] == "-a"){
			activityId = tokens[runIndex + 2];
		}
	} else {
		var namedIndex = tokens.indexOf("-n");
		if(tokens[namedIndex+1] != null && tokens[namedIndex+1] != ""){
			activityName = tokens[namedIndex + 1];
		}
	}

	if(activityId === null && activityName === null){
		var channel = self._getChannelById(originalMessage.channel);
		self.postMessageToChannel(channel.name, "Invalid activityId or activityName.", {as_user:true})
	} else if(activityId != null) {
		dwInstance.runActivity(activityId, function(err, common){
			if(err){
				var channel = self._getChannelById(originalMessage.channel);
				self.postMessageToChannel(channel.name, err, {as_user:true});
			}		

			var channel = self._getChannelById(originalMessage.channel);
			self.postMessageToChannel(channel.name, common, {as_user:true});
		});
	} else if(activityName != null) {
		dwInstance.getActivityByName(activityName, function(err, activity){
			activityId = activity.id;
			dwInstance.runActivity(activityId, function(err, common){
				if(err){
					var channel = self._getChannelById(originalMessage.channel);
					self.postMessageToChannel(channel.name, err, {as_user:true});
				}		

				var channel = self._getChannelById(originalMessage.channel);
				self.postMessageToChannel(channel.name, common, {as_user:true});
			});
		});
		
	}
};

ForgeBot.prototype._getActivityRunStatus = function(originalMessage, byName){
	var self = this;
	var tokens = originalMessage.text.split(" ");
	var activityIdToken = null;
	var activityNameToken = null;
	var activityRunIdToken = tokens.indexOf("-r")+1;
	var activityId = null;
	var activityRunId = null;
	var activityName = null;
	if(!byName){
		activityIdToken = tokens.indexOf("-a")+1;
		if(activityIdToken > 0){
			activityId = tokens[activityIdToken];
			if(activityRunIdToken > 0){
				activityRunId = tokens[activityRunIdToken];
			} 

			if(activityId == null || activityId == "" || activityRunId == null || activityRunId == "") {
				var channel = self._getChannelById(originalMessage.channel);
				self.postMessageToChannel(channel.name, "Invalid status request for activity: " + activityId +
					" run: " + activityRunId, {as_user:true});
				return;
			}
			self._getActivityRunStatusByIds(originalMessage, activityId, activityRunId);
		}
	} else {
		activityNameToken = tokens.indexOf("-n")+1;
		if(activityNameToken > 0){
			activityName = tokens[activityNameToken];
			dwInstance.getActivityByName(activityName, function(err, activity){
				activityId = activity.id;
				if(activityRunIdToken > 0){
					activityRunId = tokens[activityRunIdToken];
				}

				self._getActivityRunStatusByIds(originalMessage, activityId, activityRunId);
			});
		} 
	}
};

ForgeBot.prototype._getActivityRunStatusByIds = function(originalMessage, activityId, activityRunId){
	var self = this;
	if(activityRunId.toLowerCase() == "latest"){
		self._getActivityRuns(activityId, function(err, runs){
			var date = null;
			runs.forEach(function(run){
				var runDate = new Date(Date.parse(run.createdTimeStamp));
				if(date == null){
					date = runDate;
					activityRunId = run.id;
				} else if(date < runDate){
					date = runDate;
					activityRunId = run.id;
				}
			});
		});
	}
	dwInstance.monitorActivityRun(activityId, activityRunId, function(err, common){
		if(err){
			var channel = self._getChannelById(originalMessage.channel);
			self.postMessageToChannel(channel.name, err, {as_user:true});
		}		

		var channel = self._getChannelById(originalMessage.channel);
		self.postMessageToChannel(channel.name, common, {as_user:true});
	});
};

ForgeBot.prototype._getActivityRuns = function(activityId, callback){
	dwInstance.listActivityRuns(activityId, function(err, activityRuns){
		if(err){
			var channel = self._getChannelById(originalMessage.channel);
			self.postMessageToChannel(channel.name, err, {as_user:true});
			return callback(err);
		}	
		return callback(null, activityRuns);
	});
}