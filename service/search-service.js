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

var elasticsearch = require('elasticsearch');
var config = require('config');
var Util = require('../util/util.js');
var dateFormat = require('dateformat');
var client = new elasticsearch.Client({
    host: config.get("es.host") + ':' + config.get("es.port")
});
var indexName = config.get('es.index');
var typeName = config.get('es.type');
module.exports = function () {
    return {
        search: search,
        index: index,
        getQuery: getQuery
    };
    function search(query, channelId, callback) {
        var obj = getBaseObject();
        obj.body = getQuery(query, channelId);
        client.search(obj).then(function (body) {
            var hits = body.hits.hits;
            if (hits.length === 0) {
                return callback('Seek you term, found is not. “You will find only what you bring in.”');
            }
            var result = '“Looking? Found someone you have, eh?”';
            for (var i = 0; i < hits.length; i++) {
                var data = hits[i];
                var formattedDate = '';
                if (!Util.isUndefinedOrNull(data._source.date)) {
                    try {
                        var date = new Date(data._source.date);
                        formattedDate = '@' + dateFormat(date, "dd-mmm-yyyy h:MM TT");
                    } catch (err) {
                    }
                }
                if (data._source.subtype === 'file_share') {
                    result += '\n<@' + data._source.user + ">" + formattedDate + " : " + data._source.text + " : " + data._source.file.preview + ": Link : " + data._source.file.url_private_download;
                } else {
                    result += '\n<@' + data._source.user + ">" + formattedDate + " : " + data._source.text;
                }
            }
            return callback(result);
        }, function (error) {
            return callback('Error: ' + error.message);
        });
    }

    function index(message, callback) {
        callback = callback || function (error, response) {
            if (error) {
                console.log(response);
            } else {
                console.log('Indexed');
            }
        };

        var obj = getBaseObject();
        obj.body = message;
        return client.index(obj, callback);
    }

    function getQuery(query, channelId) {
        return {
            'query': {
                'filtered': {
                    'query': {
                        'match': {
                            '_all': query
                        }
                    },
                    'filter': {
                        'bool': {
                            'must': [
                                {
                                    'term': {
                                        'channel': channelId
                                    }
                                }
                            ]
                        }
                    }
                }
            }
        }
    }

    function getBaseObject() {
        return {
            index: indexName,
            type: typeName
        }
    }
} ();
