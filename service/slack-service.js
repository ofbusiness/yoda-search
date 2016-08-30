/*
  Copyright 2016 OFB Tech Pvt Ltd

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var SlackClient = require('slack-client');
var config = require('config');
var Util = require('../util/util.js');
var MessageConverter = require('../service/message-converter.js');
var SearchService = require('../service/search-service.js');
var searchPrefixes = ['yoda:', 'q:', 'Search you must:', 'search you must:', 'search:', 'Search:'];
var token = config.get('slack.token');
var botUserName = config.get('slack.botUserName')
var autoReconnect = true;
var autoMark = true;
var slack = new SlackClient(token, autoReconnect, autoMark);

module.exports = function () {
    return {
        start: start,
        slackInstance: slack,
        setUpOnOpenListener: setUpOnOpenListener,
        setUpOnMessageListener: setUpOnMessageListener,
        setUpOnErrorListener: setUpOnErrorListener,
        onOpen: onOpen,
        onMessageReceived: onMessageReceived,
        onError: onError
    };
    function start() {
        slack.login();
    }

    function setUpOnMessageListener(listener) {
        slack.on('message', listener);
    }

    function setUpOnErrorListener(listener) {
        slack.on('error', listener);
    }

    function setUpOnOpenListener(listener) {
        slack.on('open', listener);
    }

    function onOpen(slack) {
        return function () {
            var unreads = slack.getUnreadCount();
            var channels = (function () {
                var ref, results;
                ref = slack.channels;
                results = [];
                for (var id in ref) {
                    var channel = ref[id];
                    if (channel.is_member) {
                        results.push("#" + channel.name);
                    }
                }
                return results;
            })();
            var groups = (function () {
                var ref, results;
                ref = slack.groups;
                results = [];
                for (var id in ref) {
                    var group = ref[id];
                    if (group.is_open && !group.is_archived) {
                        results.push(group.name);
                    }
                }
                return results;
            })();
            console.log("Welcome to Slack. You are @" + slack.self.name + " of " + slack.team.name);
            console.log('You are in: ' + channels.join(', '));
            console.log('As well as: ' + groups.join(', '));
            var messages = unreads === 1 ? 'message' : 'messages';
            return console.log("You have " + unreads + " unread " + messages);
        };
    }

    function onMessageReceived(slack) {
        return function (message) {
            var channel = slack.getChannelGroupOrDMByID(message.channel);
            var convertedMessage = MessageConverter.convertMessage(slack, message);
            if (convertedMessage.userName === botUserName) {
                return;
            }
            var searchPrefix = Util.stringStartsWithOneOf(convertedMessage.text, searchPrefixes);
            if (searchPrefix) {
                var query = convertedMessage.text.replace(searchPrefix, '');
                console.log('Its a query : ', query);
                SearchService.search(query, convertedMessage.channel, function (response) {
                    return channel.send(response.substr(0, 4000));
                });
            } else {
                SearchService.index(convertedMessage);
            }
        };
    }

    function onError(error) {
        return console.error("Error: " + error);
    }
} ();
