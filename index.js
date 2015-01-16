var scraper = require('./scraper');

scraper.scrapeScriptingCommands(function scrapingDone(err, data) {
    if (err) {
        console.log(err);
    }
   //console.log(data);
});