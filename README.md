# Yoda-Search
## About
For detailed coverage, please visit [our blog] (https://medium.com/ofbusiness-tech/yoda-search-a-slackbot-for-search-a1c459576e3e#.nap4gwogy)

Yoda is a slack bot that indexes your messages in Elasticsearch so that you can search your messages past the 10,000 messages limit imposed Slack’s free tier.

## How To Use?
To execute a query privately, type:-

`/yoda [query] , for example, /yoda deployment`

That queries your messages and returns matching responses from the current channel, group, or conversation. The query response is visible only to you.

For a public response, use the format:-

`q:[query], for example, q:hello`

This will do the same thing, but the query and response will be visible to everyone in your group or channel.

NOTE: For private queries, the slash command invocation(/yoda) is dependent upon your configuration. You could configure it to respond to /blahblah if you wish to.
## Setup instructions

 - Setup [Elasticsearch](https://www.elastic.co/products/elasticsearch) on your machine
 - Configure a [Slack Bot User](https://api.slack.com/bot-users). This will be used for RTM messaging
 - Also configure a [Slash Command](https://api.slack.com/custom-integrations)
 - Put these configuration settings in the config file for your environment(development.json or production.json)
 - Install dependencies using `npm install`
 - Set your environment if needed using `export NODE_ENV=production`. Development is the default environment.
 - Run the app using `node yoda.js`, or your custom configuration( [PM2](http://pm2.keymetrics.io/) for instance)

 ## Contributions
Contributions are welcome through Github issues and pull request.
Please make sure that you format your code using an editor that supports EditorConfig.
Code away!

## Credits
Thanks to the following projects:-
 - [Elasticsearch](https://github.com/elastic/elasticsearch)
 - [Slack Client](https://www.npmjs.com/package/slack-client) (Deprecated)
 - [Config](https://github.com/lorenwest/node-config)
 - [querystring](https://github.com/Gozala/querystring)
 
## License
    Licensed under the Apache License, Version 2.0 (the "License");
    You may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.`
