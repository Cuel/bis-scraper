var request = require('request');
var cheerio = require('cheerio');
var chalk = require('chalk');

const URL_BASE = 'http://community.bistudio.com';
const URL_A3_SCRIPT_COMMANDS = URL_BASE + '/wiki/Category:Scripting_Commands_Arma_3';
const URL_BIS_FUNCTIONS = URL_BASE + '/wiki/Category:Arma_3:_Functions';

/**
 * Requests a BI site and get the html
 * @private
 * @param {String} URL to BI site
 * @param {Function} callback to be given JSON with scraped funcions
 */
function requestAndScrapeSite(siteUrl, callback) {

    request(siteUrl, function siteRequested(err, res, html) {

        if (err) {
            return callback(err);
        }

        if (res.statusCode !== 200) {
            var e = new Error('Did not get expected header code (200), was: ' + res.statusCode);
            return callback(e);
        }

        parseScriptingCommandsFromHTML(html, callback);
    });
}

/**
 * Attempts to parse given HTML from the BI wiki
 * @private
 * @param {String} html
 * @param {Function} callback
 */
function parseScriptingCommandsFromHTML(html, callback) {

    var $ = cheerio.load(html);
    var ret = {};
    var root = $('#mw-pages table').first();

    // h3 ul > li > a
    root.find('h3').each(function () {
        // don't parse operators
        if ($(this).html().trim() !== '#') {
            $(this).next().find('li a[href]').each(parse);
        }
    });

    function parse() {
        var name = $(this).attr('title').trim();
        var url = $(this).attr('href').trim();
        if (ret[name]) {
            return console.log(chalk.red('Warning: Duplicate entry found: %s, skipping...'), name);
        }
        ret[name] = {
            name: name,
            wikiUrl: URL_BASE + url
        };
    }

    callback(null, ret);
}

exports.getCommands = function (callback) {
    console.log(chalk.green('Requesting site: %s'), URL_A3_SCRIPT_COMMANDS);

    requestAndScrapeSite(URL_A3_SCRIPT_COMMANDS, function scrapeDone(err, data) {
        if (err) {
            return callback(err);
        }

        console.log(chalk.green('Successfully parsed %d commands from %s'), Object.keys(data).length, URL_A3_SCRIPT_COMMANDS);
        callback(null, {
            BIS_Commands: data
        });
    });
};

exports.getFunctions = function (callback) {
    console.log(chalk.green('Requesting site: %s'), URL_BIS_FUNCTIONS);

    requestAndScrapeSite(URL_BIS_FUNCTIONS, function scrapeDone(err, data) {
        if (err) {
            return callback(err);
        }

        console.log(chalk.green('Successfully parsed %d commands from %s'), Object.keys(data).length, URL_BIS_FUNCTIONS);
        callback(null, {
            BIS_Functions: data
        });
    });
};