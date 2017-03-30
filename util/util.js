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
    },
    getMatches: function (string, regex, index) {
        index || (index = 1); // default to the first capturing group
        var matches = [];
        var match;
        while (match = regex.exec(string)) {
            matches.push(match[index]);
        }
        return matches;
    }
};
