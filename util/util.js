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

module.exports = {
    isUndefined: function (obj) {
        return typeof obj === 'undefined';
    },
    isUndefinedOrNull: function (obj) {
        return typeof obj === 'undefined' || obj === null;
    },
    stringStartsWith: function (string, prefix) {
        try {
            return string.slice(0, prefix.length) == prefix;
        } catch (err) {
            console.error(JSON.stringify(err));
        }
        return false;

    },
    stringStartsWithOneOf: function (string, prefixArray) {
        for (var i = 0; i < prefixArray.length; i++) {
            if (this.stringStartsWith(string, prefixArray[i])) {
                return prefixArray[i];
            }
        }
        return undefined;
    }
};
