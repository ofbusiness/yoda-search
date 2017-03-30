var SlackApi = require('./service/slack-api');
var server = require('./server.js');
var messageIndexPlugin = require('./service/message-index-plugin');
var pullRequestPlugin = require('./service/pull-request-plugin');
SlackApi.rtmStart([messageIndexPlugin.messageIndexHandler, pullRequestPlugin.pullRequestCheckerHandler]);
server();