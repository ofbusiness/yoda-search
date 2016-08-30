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

var config = require('config');
var SearchService = require('./service/search-service.js');
var serverPort = config.get('slashCommand.port');
var slashCommandToken = config.get('slashCommand.token');
var http = require('http');
var queryString = require('querystring');

module.exports = function () {
    http.createServer(function (req, res) {

        // handle the routes
        if (req.method == 'POST' && req.url == '/search') {
            handleSearchRequest(req, res);
        } else {
            console.log('Unsupported request incoming');
        }
        req.pipe(process.stdout);
    }).listen(serverPort);
};

function handleSearchRequest(req, res) {
    var fullBody = '';
    req.on('data', function (chunk) {
        fullBody += chunk.toString();
        if (fullBody.length > 1e6) {
            // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
            console.log("\n Nuking request due to overloaded body \n");
            req.connection.destroy();
        }
    });

    req.on('end', function () {
        var decodedBody = queryString.parse(fullBody);
        if (decodedBody.token === slashCommandToken) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            SearchService.search(decodedBody.text, decodedBody.channel_id, function (searchResponse) {
                res.write(searchResponse);
                res.end();
            });

        } else {
            console.log('Incorrect token found for request');
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.write('Bad request. Token mismatch.');
            res.end();
        }
    });
}
