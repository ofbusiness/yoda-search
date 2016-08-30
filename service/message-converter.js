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

module.exports = function () {
    return {
        convertMessage: convertMessage
    };
    function convertMessage(slack, message) {
        var convertedMessage = {};
        var channel = slack.getChannelGroupOrDMByID(message.channel);
        var user = slack.getUserByID(message.user);
        var channelName = channel ? channel.name : 'UNKNOWN_CHANNEL';
        var userName = (user != null ? user.name : void 0) != null ? "@" + user.name : "UNKNOWN_USER";

        convertedMessage.user = message.user;
        convertedMessage.userName = userName;
        convertedMessage.channel = message.channel;
        convertedMessage.channelName = channelName;
        convertedMessage.ts = message.ts;
        convertedMessage.team = message._client.team.id;
        convertedMessage.teamName = message._client.team.name;
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
        } else {
            console.log('Message type is not message. Can\'t touch this!');
        }
        return convertedMessage;
    }
} ();
