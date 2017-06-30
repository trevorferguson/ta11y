import ta11yConfig from './.ta11yrc.json';
import path from 'path';
import fs from 'fs';
import pa11y from 'pa11y';
import xml2js from 'xml2js';
import htmlReporter from 'pa11y/reporter/html';
import async from 'async';
import yargs from 'yargs';
import sitemapParser from 'sitemapParser.js';

yargs.help('help');

let xml2jsParser = new xml2js.Parser();
let pa11yTest = pa11y(ta11yConfig.pa11y);

let queue = async.queue((url, done) => {
  pa11yTest.run(url.url, function (err, results) {
    let html;

    if (err) {
      return console.error(err.message);
    }

    console.log(url.url);
    // html = htmlReporter.process(results, url.url);

    fs.writeFile('./output/' + url.idx + '.json', JSON.stringify(results), (err) => {
      console.log('file: ' + './output/' + url.idx + '.json' + ' saved!');
    });

    done();
  });
}, ta11yConfig.concurrency);

fs.readFile(path.join(__dirname, ta11yConfig.sitemap), (err, data) => {
  if (err) {
    console.log('fs.readFile error ', err);
  }

  let command = 'sitemap'

  xml2jsParser.parseString(data, (err, result) => {
    let urls = [];

    urls = sitemapParser(data, filter);

    if (err) {
      throw (err);
    }

    if (result.urlset.url) {
      result.urlset.url.forEach((url, idx) => {
        urls.push({idx: idx, url: url.loc[0]});
      });
    }

    queue.push(urls);
  });
});

queue.drain = () => {
  console.log('All done!');
};
