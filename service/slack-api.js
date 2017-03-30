var config = require('config');
var Util = require('../util/util.js');
var Promise = require('promise-js');
var RtmClient = require('@slack/client').RtmClient;
var WebClient = require('@slack/client').WebClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var token = config.get('slack.token');
var web = new WebClient(token);
var rtm = new RtmClient(token);

module.exports = function () {
    return {
        getUserName: getUserName,
        getChannelName: getChannelName,
        getGroupName: getGroupName,
        getChannelNameOrGroupNameOrDirectChannel: getChannelNameOrGroupNameOrDirectChannel,
        getBotInfo: getBotInfo,
        getTeamName: getTeamName,
        addReaction: addReaction,
        rtmStart: rtmStart
    };
}();

function getUserName(userId) {
    return new Promise(function (resolve, reject) {
        web.users.info(userId, function (err, response) {
            if (err || !response.ok) {
                return reject(err);
            }
            resolve(response.user.name);
        })
    });
}

function getChannelNameOrGroupNameOrDirectChannel(channelId) {
    if (channelId.indexOf('C') == 0) {
        return getChannelName(channelId);
    } else if (channelId.indexOf('G') == 0) {
        return getGroupName(channelId);
    } else if (channelId.indexOf('D') == 0) {
        return new Promise(function (resolve, reject) {
            resolve('DirectChannel')
        });
    }
    return new Promise(function (resolve, reject) {
        resolve('UnknownChannel')
    });
}

function getChannelName(channelId) {
    return new Promise(function (resolve, reject) {
        web.channels.info(channelId, function (err, response) {
            if (err || !response.ok) {
                return reject(err);
            }
            resolve(response.channel.name);
        })
    });
}

function getGroupName(groupId) {
    return new Promise(function (resolve, reject) {
        web.groups.info(groupId, function (err, response) {
            if (err || !response.ok) {
                return reject(err);
            }
            resolve(response.group.name);
        })
    });
}
function getBotInfo(botId) {
    return new Promise(function (resolve, reject) {
        web.bots.info(botId, function (err, response) {
            console.log('getBotInfo', botId, response);
            if (err || !response.ok) {
                return reject(err);
            }
            resolve(response.channel.name);
        })
    });
}

function getTeamName() {
    return new Promise(function (resolve, reject) {
        web.team.info(function (err, response) {
            if (err || !response.ok) {
                return reject(err);
            }
            resolve(response.team.name);
        })
    });
}

function addReaction(reactionName, channel, ts) {
    return new Promise(function (resolve, reject) {
        web.reactions.add(reactionName, { channel: channel, timestamp: ts }, function (err, res) {
            if (err) {
                return reject(err);
            }
            resolve("Message sent");
        });
    });
}

function rtmStart(messageHandlers) {
    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
        console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
    });
    rtm.on(RTM_EVENTS.MESSAGE, function (message) {
        console.log(message);
        messageHandlers.forEach(function (handler) {
            handler.call(null, message);
        });
    });
    rtm.start();
}