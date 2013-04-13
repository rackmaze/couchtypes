/**
 * General utility functions used by CouchTypes modules.
 *
 * @module
 */


/**
 * Module dependencies
 */

var _ = require('underscore')._;


/**
 * Traverses an object and its sub-objects using an array of property names.
 * Returns the value of the matched path, or undefined if the property does not
 * exist.
 *
 * If a string if used for the path, it is assumed to be a path with a single
 * key (the given string).
 *
 * <pre>
 * getPropertyPath({a: {b: 'foo'}}, ['a','b']) -> 'foo'
 * getPropertyPath({a: {b: 'foo'}}, 'a') -> {b: 'foo'}
 * </pre>
 *
 * @name getPropertyPath(obj, path)
 * @param {Object} obj
 * @param {Array|String} path
 * @api public
 */

exports.getPropertyPath = function (obj, path) {
    if (!_.isArray(path)) {
        path = [path];
    }
    if (!path.length || !obj) {
        return obj;
    }
    return exports.getPropertyPath(obj[path[0]], path.slice(1));
};


/**
 * Call function with arguments, catch any errors and add to an array,
 * returning the modified array.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Array} args
 * @returns {Array}
 * @api private
 */

exports.getErrors = function (fn, args) {
    var arr = [];
    try {
        arr = arr.concat(fn.apply(this, args) || []);
    }
    catch (e) {
        arr.push(e);
    }
    return arr;
};

/**
 * Parse CSV strings into an array of rows, each row an array of values.
 * Used by the array field's default CSV widget.
 *
 * @name parseCSV(csvString)
 * @param {String} csvString
 * @returns {Array}
 * @api public
 */

// Parsing comma-separated values (CSV) in JavaScript by M. A. SRIDHAR
// http://yawgb.blogspot.com/2009/03/parsing-comma-separated-values-in.html
exports.parseCSV = function (csvString) {
    var fieldEndMarker  = /([,\015\012] *)/g;
    var qFieldEndMarker = /("")*"([,\015\012] *)/g;
    var startIndex = 0;
    var records = [], currentRecord = [];
    do {
        var ch = csvString.charAt(startIndex);
        var endMarkerRE = (ch === '"') ? qFieldEndMarker : fieldEndMarker;
        endMarkerRE.lastIndex = startIndex;
        var matchArray = endMarkerRE.exec(csvString);
        if (!matchArray || !matchArray.length) {
            break;
        }
        var endIndex = endMarkerRE.lastIndex;
        endIndex -= matchArray[matchArray.length - 1].length;
        var match = csvString.substring(startIndex, endIndex);
        if (match.charAt(0) === '"') {
            match = match.substring(1, match.length - 1).replace(/""/g, '"');
        }
        currentRecord.push(match);
        var marker = matchArray[0];
        if (marker.indexOf(',') < 0) {
            records.push(currentRecord);
            currentRecord = [];
        }
        startIndex = endMarkerRE.lastIndex;
    } while (true);
    if (startIndex < csvString.length) {
        var remaining = csvString.substring(startIndex).trim();
        if (remaining) {
            currentRecord.push(remaining);
        }
    }
    if (currentRecord.length > 0) {
        records.push(currentRecord);
    }
    return records;
};


/**
 * Returns attachments below a given path from a document, returning an object
 * with the attachment names relative to that path. Example:
 *
 *     var doc = {_attachments: {
 *         'foo/bar.ext': {data: 'one', ...},
 *         'foo/baz.ext': {data: 'two', ...},
 *         'asdf.ext':    {data: 'blah', ...}
 *     }};
 *
 *     utils.attachmentsBelowPath(doc, 'foo') => {
 *         'bar.ext': {data: 'one', ...},
 *         'baz.ext': {data: 'two', ...}
 *     }
 *
 * @name attachmentsBelowPath(doc, path)
 * @param {Object} doc
 * @param {String | Array} path
 * @api public
 */

exports.attachmentsBelowPath = function (doc, path) {
    if (!doc || !doc._attachments) {
        return {};
    }
    if (_.isArray(path)) {
        path = path.join('/');
    }
    var results = {};
    for (var k in doc._attachments) {
        if (k.substr(0, path.length + 1) === path + '/') {
            results[k.substr(path.length + 1)] = doc._attachments[k];
        }
    };
    return results;
};
