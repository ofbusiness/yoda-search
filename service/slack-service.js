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

var SlackClient = require('@slack/client');
var RtmClient = SlackClient.RtmClient;
var CLIENT_EVENTS = SlackClient.CLIENT_EVENTS;
var RTM_EVENTS = SlackClient.RTM_EVENTS;
var MemoryDataStore = SlackClient.MemoryDataStore;

var config = require('config');
var Util = require('../util/util.js');
var MessageConverter = require('../service/message-converter.js');
var SearchService = require('../service/search-service.js');
var searchPrefixes = ['yoda:', 'q:', 'Search you must:', 'search you must:', 'search:', 'Search:'];
var token = config.get('slack.token');
var botUserName = config.get('slack.botUserName')
var autoReconnect = true;
var autoMark = true;
var slack = new RtmClient(token, {// Sets the level of logging we require
    // Sets the level of logging we require
    logLevel: 'error',
    // Initialise a data store for our client, this will load additional helper functions for the storing and retrieval of data
    dataStore: new MemoryDataStore()
});

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
        slack.start();
    }

    function setUpOnMessageListener(listener) {
        slack.on(RTM_EVENTS.MESSAGE, listener);
    }

    function setUpOnErrorListener(listener) {
        slack.on(CLIENT_EVENTS.RTM.WS_ERROR, listener);
    }

    function setUpOnOpenListener(listener) {
        slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, listener);
    }

    function onOpen(dataStore) {
        return function (rtmStartData) {
            dataStore.cacheRtmStart(rtmStartData);
            var channels = (function () {
                var ref, results;
                ref = rtmStartData.channels;
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
                ref = rtmStartData.groups;
                results = [];
                for (var id in ref) {
                    var group = ref[id];
                    if (group.is_open && !group.is_archived) {
                        results.push(group.name);
                    }
                }
                return results;
            })();
            console.log("Welcome to Slack. You are @" + rtmStartData.self.name + " of " + rtmStartData.team.name);
            console.log('You are in: ' + channels.join(', '));
            console.log('As well as: ' + groups.join(', '));
        };
    }

    function onMessageReceived(rtmClient) {
        var dataStore = rtmClient.dataStore;
        return function (message) {
            var channel = dataStore.getChannelGroupOrDMById(message.channel);
            var convertedMessage = MessageConverter.convertMessage(dataStore, message);
            if (convertedMessage.userName === botUserName) {
                return;
            }
            var searchPrefix = Util.stringStartsWithOneOf(convertedMessage.text, searchPrefixes);
            if (searchPrefix) {
                var query = convertedMessage.text.replace(searchPrefix, '').trim();
                console.log('Its a query : ', query);
                SearchService.search(query, convertedMessage.channel, function (response) {
                    return rtmClient.sendMessage(response.substr(0, 4000), convertedMessage.channel);
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
