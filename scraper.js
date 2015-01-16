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
            console.trace(chalk.red('Request failed: %d'), err.message);
            return callback(err);
        }

        if (res.statusCode !== 200) {
            var e = new Error('Did not get expected header code (200), was: ' + res.statusCode);
            console.error(chalk.red(e.message));
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
    var root = $('#mw-pages table').first();
    var ret = {};

    root.find('h3').each(function () {
        // don't parse operators
        if ($(this).html().trim() !== '#') {
            $(this).next().find('li a[href]').each(parseCommand);
        }
    });

    function parseCommand() {
        var commandName = $(this).attr('title');
        var commandUrl = $(this).attr('href');
        ret[commandName] = {
            command: commandName,
            url: URL_BASE + commandUrl
        };
    }

    console.log(chalk.green('Successfully parsed %d commands from the site'), Object.keys(ret).length);
    callback(null, ret);
}

exports.scrapeScriptingCommands = function (callback) {
    console.log(chalk.green('Requesting site: %s'), URL_A3_SCRIPT_COMMANDS);
    
    requestAndScrapeSite(URL_A3_SCRIPT_COMMANDS, function scrapeDone(err, data) {
        if (err) {
            return callback(err);
        }
        
        callback(null, {
           BIS_Commands: data 
        });
    });
};

exports.scrapeFunctionsBIS = function (callback) {
    console.log(chalk.green('Requesting site: %s'), URL_BIS_FUNCTIONS);

    requestAndScrapeSite(URL_BIS_FUNCTIONS, function scrapeDone(err, data) {
        if (err) {
            return callback(err);
        }
        
        callback(null, {
           BIS_Functions: data 
        });
    });  
};