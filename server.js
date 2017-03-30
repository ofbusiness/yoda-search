var config = require('config');
var SearchService = require('./service/search-service.js');
var serverPort = config.get('slashCommand.port');
var slashCommandToken = config.get('slashCommand.token');
var http = require('http');
var queryString = require('querystring');
var createHandler = require('github-webhook-handler');
var handler = createHandler({ path: '/githubhook', secret: config.get('github.webHookSecret') });
var pullRequestPlugin = require('./service/pull-request-plugin');

module.exports = function () {
	http.createServer(function (req, res) {
		console.log(req.url);
		// handle the routes
		if (req.method == 'POST' && req.url == '/search') {
			handleSearchRequest(req, res);
		} else if (req.method == 'POST' && req.url == '/githubhook') {
			handler(req, res, function (err) {
				res.statusCode = 404
				res.end('no such location')
			});
		} else {
			console.log('Unsupported request incoming');
			res.statusCode = 401;
			res.end('None shall pass');
		}
		// req.pipe(process.stdout);
	}).listen(serverPort);
};

handler.on('pull_request', pullRequestPlugin.pullRequestWebHookHandler);

handler.on('error', function (err) {
	console.error('pull_request hook error:', err.message)
});

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
