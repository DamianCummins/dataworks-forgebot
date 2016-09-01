var chai = require('chai');
var expect = chai.expect;
var ForgeBot = require('../lib/forgebot');
var sinon = require('sinon');
var Bot = require('slackbots');
var forgebot = null;
before(function(){
	forgebot = new ForgeBot({
	        token: 'dummytoken',
	        dbPath: '../data/forgebot.db',
	        name: 'forgebot'
	});

	sinon.stub(Bot.prototype, 'login', function(){
		return;
	});

	sinon.stub(Bot.prototype, 'postMessageToChannel', function(channel, message, options){
		return;
	});

	sinon.stub(ForgeBot.prototype, '_getChannelById', function(channelId){
		return {
			id: 'C1',
			name: 'general'
		};
	});

	sinon.stub(ForgeBot.prototype, '_isFromForgeBot', function(message){
		return false;
	})
});

describe('PostUsage', function(){
	
	it('Should post a message containing the Usage', function(){
		var message = {
			type: 'message',
			text: 'forgebot usage',
			channel: "C1",
			user: "testUser"
		};
		forgebot._onMessage(message);
		expect(Bot.prototype.postMessageToChannel.getCall(0).args[0]).to.equal('general');
		expect(Bot.prototype.postMessageToChannel.getCall(0).args[1]).to.include('Forgebot Commands');
	});
});

describe('IsUsageMessage', function(){

	it('Should check that a usage message can be identified', function(){
		var message = {
			text: 'forgebot usage'
		};
		expect(forgebot._isUsage(message)).to.equal(true);
		message = {
			text: 'forgebot Commands'
		};
		expect(forgebot._isUsage(message)).to.equal(true);
		message = {
			text: 'forgebot help'
		};
		expect(forgebot._isUsage(message)).to.equal(true);
		message = {
			text: 'forgebot hey'
		};
		expect(forgebot._isUsage(message)).to.equal(false);
	});
});

describe('IsChatMessage', function(){

	it('Should check that a chat message can be identified', function(){
		var message = {
			type: 'message',
			text: 'forgebot hey',
			channel: "C1",
			user: "testUser"
		};
		expect(forgebot._isChatMessage(message)).to.equal(true);
		message = {
			text: 'forgebot hey',
			channel: "C1",
			user: "testUser"
		};
		expect(forgebot._isChatMessage(message)).to.equal(false);
	});
});

describe('IsChannelConversation', function(){

	it('Should check that a channel conversation can be identified', function(){
		var message = {
			type: 'message',
			text: 'forgebot hey',
			channel: "C1",
			user: "testUser"
		};
		expect(forgebot._isChannelConversation(message)).to.equal(true);
	});
});

describe('IsMentioningForgebot', function(){

	it('Should identify Forgebot has been mentioned', function(){
		var message = {
			type: 'message',
			text: 'forgebot hey',
			channel: "C1",
			user: "testUser"
		};
		expect(forgebot._isMentioningForgeBot(message)).to.equal(true);
		message = {
			type: 'message',
			text: 'frogebto hey',
			channel: "C1",
			user: "testUser"
		};
		expect(forgebot._isMentioningForgeBot(message)).to.equal(false);
	});
});

describe('IsListActivitiesMessage', function(){

	it('Should identify request to list activities', function(){
		var message = {
			type: 'message',
			text: 'forgebot list activities',
			channel: "C1",
			user: "testUser"
		};
		expect(forgebot._isListActivities(message)).to.equal(true);
		message = {
			type: 'message',
			text: 'forgebot list activities -v',
			channel: "C1",
			user: "testUser"
		};
		expect(forgebot._isListActivitiesInFull(message)).to.equal(true);
	});
});

after(function(){
	Bot.prototype.login.restore();
	Bot.prototype.postMessageToChannel.restore();
	ForgeBot.prototype._getChannelById.restore();
	ForgeBot.prototype._isFromForgeBot.restore();
});