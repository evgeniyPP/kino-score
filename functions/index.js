const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const puppeteer = require('puppeteer');

const scrapeKinopoisk = async query => {
  const url = `https://www.kinopoisk.ru/index.php?kp_query=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);
  return {
    name: $('.most_wanted .info .name a').text(),
    year: $('.most_wanted .info .name .year').text(),
    englishName: $('.most_wanted .info .name + .gray')
      .text()
      .replace(/,.+/, ''),
    rating: $('.most_wanted .rating').text()
  };
};

exports.kinopoisk = functions.region('europe-west1').https.onRequest((req, res) => {
  cors(req, res, async () => {
    const data = await scrapeKinopoisk(req.body.query);
    res.send(data);
  });
});

const scrapeTomatoes = async (title, year) => {
  const query = title.replace(/\s/g, '%20');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (
      req.resourceType() === 'stylesheet' ||
      req.resourceType() === 'font' ||
      req.resourceType() === 'image'
    )
      req.abort();
    else req.continue();
  });

  await page.goto(`https://www.rottentomatoes.com/search/?search=${query}`);

  const data = await page.evaluate(() => {
    const ratings = Array.from(
      document.querySelectorAll('.search__results-movies .search__results-item-tomatometer span')
    )
      .map(rating => rating.textContent.replace(/\s|%/g, ''))
      .filter(item => item !== '');
    const names = Array.from(
      document.querySelectorAll('.search__results-movies .search__results-item-info-name')
    ).map(name => name.textContent);
    const years = Array.from(
      document.querySelectorAll('.search__results-movies .search__results-item-info-year')
    ).map(year => year.textContent.replace(/\s|\(|\)/g, ''));

    return names.map((name, index) => {
      return {
        name: name,
        year: years[index],
        rating: ratings[index]
      };
    });
  });

  const result = data.filter(film => film.name === title && film.year === year)[0];

  await browser.close();
  return result;
};

exports.tomatoes = functions.region('europe-west1').https.onRequest((req, res) => {
  cors(req, res, async () => {
    const data = await scrapeTomatoes(req.body.title, req.body.year);
    res.send(data);
  });
});
