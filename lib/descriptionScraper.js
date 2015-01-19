/**
 * Scrapes specific commmands from the BI wiki
 */

var cheerio = require('cheerio');
var request = require('request');
var sanitizeHtml = require('sanitize-html');
var chalk = require('chalk');

const ALLOWED_HTML_TAGS = ['div','a', 'h3', 'span', 'dl', 'dt', 'dd', 'br', 'b', 'strong', 'table', 'tbody', 'thead',
                          'th', 'td', 'tr', 'li', 'i', 'code'];
const ALLOWED_ATTRS = ['title', 'href'];

exports.scrapeCommand = function (commandUrl, callback) {
    if (commandUrl.indexOf('http') < 0) {
        return callback(new Error('Faulty URL given: %s', commandUrl));
    }

    request(commandUrl, function (err, res, html) {
        if (err) {
            return callback(err.message ||  err);
        }
        
        parseHTML(html);
        
    });

};

function sanitize(html) {
    if (!html || 'string' !== typeof html) {
        return null;
    }
    return sanitizeHtml(html, {
        allowedTags: ALLOWED_HTML_TAGS,
        allowedAttributes: ALLOWED_ATTRS
    });
}

function parseHTML(html) {
    var parsedHTML = {};
    var $ = cheerio.load(html);
    var root = $('#mw-content-text');
    parsedHTML.description = sanitize(parseDescription(root));
}

function parseDescription(html) {
    var text = html.find('#Description').parent().next().find('dd');
    return text;
}