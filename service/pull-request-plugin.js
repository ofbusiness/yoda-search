var Promise = require('promise-js');
var request = require('request');
var SearchService = require('../service/search-service.js');
var SlackApi = require('../service/slack-api');
var Util = require('../util/util');
var config = require('config');
var githubApiToken = config.get('github.apiToken');
var mergedReactions = ['m1', 'm2', 'm3', 'm4'];
var closedReactions = ['c1', 'c2', 'c3', 'c4'];
var low = require('lowdb');
const db = low(config.get('lowdb.path'));
db.defaults({ urls: [] }).write();

module.exports = function () {
    return {
        pullRequestCheckerHandler: pullRequestCheckerHandler,
        pullRequestWebHookHandler: pullRequestWebHookHandler,
    }
}();

function pullRequestCheckerHandler(message) {
    console.log('pullRequestCheckerHandler called');
    var obj = {};
    var regex = /<(https:\/\/github.com\/ofbusiness\/(.*)\/pull\/.*?)>/g;
    var matches = Util.getMatches(message.text, regex);
    var promises = matches.map(function (item) {
        var repositoryName = item.split('https://github.com/ofbusiness/')[1].split('/')[0];
        var prNumber = item.split('https://github.com/ofbusiness/' + repositoryName + '/pull/')[1].split('/')[0];
        var url = 'https://api.github.com/repos/ofbusiness/' + repositoryName + '/pulls/' + prNumber;
        return getPRStatus(url);
    });

    Promise.all(promises)
        .then(success, error);

    function success(results) {
        results.forEach(function (result) {
            if (result) {
                obj[message.channel + "::" + message.ts + "::" + result.url] = result;
            }
        });

        var keys = Object.keys(obj)
        var length = Math.min(keys.length, 4);
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            var urlObj = obj[key];
            urlObj.channel = message.channel;
            urlObj.ts = message.ts;
            urlObj.i = i;
            if (urlObj.state === 'closed') {
                if (urlObj.merged) {
                    //send ith merged reaction for channel and ts
                    SlackApi.addReaction(mergedReactions[urlObj.i], urlObj.channel, urlObj.ts);
                } else {
                    //send ith closed reaction for channel and ts
                    SlackApi.addReaction(closedReactions[urlObj.i], urlObj.channel, urlObj.ts);
                }
            } else {
                //send data to db and wait for github hook 
                db.get('urls')
                    .push(urlObj)
                    .write();
            }
        }
    }

    function error(err) {
        console.log('err', err);
    }
}

function pullRequestWebHookHandler(event) {
    var apiUrl = event.payload.pull_request.url;
    var htmlUrl = event.payload.pull_request.html_url;
    var state = event.payload.pull_request.state;
    var merged = event.payload.pull_request.merged;
    if (state === 'closed') {
        var urlObjs = db.get('urls').filter({ url: apiUrl }).value();
        urlObjs.forEach(function (urlObj) {
            if (merged) {
                SlackApi.addReaction(mergedReactions[urlObj.i], urlObj.channel, urlObj.ts);
            } else {
                SlackApi.addReaction(closedReactions[urlObj.i], urlObj.channel, urlObj.ts);
            }
            db.get('urls').remove({ url: urlObj.url, ts: urlObj.ts }).write();
        })
    }

}

function getPRStatus(url) {
    return new Promise(function (resolve, reject) {
        request({
            url: url,
            headers: {
                'Authorization': 'token ' + githubApiToken,
                'User-Agent': 'request'
            }
        }, function callback(error, response, body) {
            if (error || response == null || response.statusCode != 200) {
                return reject(error);
            }
            var info = JSON.parse(body);
            var value = {
                url: url,
                state: info.state,
                merged: info.merged
            };
            resolve({
                url: url,
                state: info.state,
                merged: info.merged
            });
        });
    });
}