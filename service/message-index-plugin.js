var Promise = require('promise-js');
var SearchService = require('../service/search-service.js');
var SlackApi = require('../service/slack-api');
module.exports = function () {
    return {
        messageIndexHandler: messageIndexHandler
    }
}();

function messageIndexHandler(message) {
    var result = convertMessage(message)
    result.then(function success(convertedMessage) {
        SearchService.index(convertedMessage);
    }, function error(err) {
        console.log("Skipping : " + message, err);
    });
}

function convertMessage(message) {
    return new Promise(function (resolve, reject) {
        var convertedMessage = {};
        Promise.all([SlackApi.getUserName(message.user), 
        SlackApi.getChannelNameOrGroupNameOrDirectChannel(message.channel), SlackApi.getTeamName()])
            .then(success, error);

        function success(values) {
            var channel = message.channel;
            var user = message.user;
            var userName = values[0];
            var channelName = values[1];
            var teamName = values[2];

            convertedMessage.user = message.user;
            convertedMessage.userName = userName;
            convertedMessage.channel = message.channel;
            convertedMessage.channelName = channelName || groupName || 'DirectChannel';
            convertedMessage.ts = message.ts;
            convertedMessage.team = message.team;
            convertedMessage.teamName = message.teamName;
            convertedMessage.type = message.type;
            convertedMessage.date = new Date().getTime();
            if (message.type === 'message') {
                if (message.subtype === 'file_share') {
                    convertedMessage.subtype = 'file_share';
                    convertedMessage.file = message.file;
                    convertedMessage.text = convertedMessage.file.title + "." + convertedMessage.file.filetype;
                } else {
                    convertedMessage.subtype = 'message';
                    convertedMessage.file = {};
                    convertedMessage.text = message.text;
                }
                return resolve(convertedMessage);
            }
            reject("Incorrect message type")
        }

        function error(err) {
            return reject(err);
        }

    });

}
