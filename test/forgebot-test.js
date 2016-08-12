var chai = require('chai');
var expect = chai.expect;
var ForgeBot = require('../lib/forgebot');
var sinon = require('sinon');
var Bot = require('slackbots');

before(function(){
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

describe('IsUsageMessage', function(){

	it('Should check that a usage message can be identified', function(){
		var forgebot = new ForgeBot({
			token: 'dummytoken',
			dbPath: '../data/forgebot.db',
			name: 'forgebot'
		});
		var message = {
			text: 'forgebot usage'
		};
		expect(ForgeBot.prototype._isUsage(message)).to.equal(true);
		message = {
			text: 'forgebot Commands'
		};
		expect(ForgeBot.prototype._isUsage(message)).to.equal(true);
		message = {
			text: 'forgebot help'
		};
		expect(ForgeBot.prototype._isUsage(message)).to.equal(true);
		message = {
			text: 'forgebot hey'
		};
		expect(ForgeBot.prototype._isUsage(message)).to.equal(false);
	});
});

describe('PostUsage', function(){

	it('Should post a message containing the Usage', function(){
		var forgebot = new ForgeBot({
			token: 'dummytoken',
			dbPath: '../data/forgebot.db',
			name: 'forgebot'
		});
		var message = {
			type: 'message',
			text: 'forgebot usage',
			channel: "C1",
			user: "testUser"
		};
		ForgeBot.prototype._onMessage(message);
		expect(Bot.prototype.postMessageToChannel.getCall(0).args[0]).to.equal('general');
		expect(Bot.prototype.postMessageToChannel.getCall(0).args[1]).to.include('Forgebot Commands');
	});
});

after(function(){
	Bot.prototype.login.restore();
	Bot.prototype.postMessageToChannel.restore();
	ForgeBot.prototype._getChannelById.restore();
	ForgeBot.prototype._isFromForgeBot.restore();
});