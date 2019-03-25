// Requires
const fs = require('fs');
const axios = require('axios');
const puppeteer = require('puppeteer');
const { getConfig } = require('./config');

// Fil Bleu website URLs
const filBleuUrl = 'https://www.filbleu.fr/espace-perso';
const filBleuDocumentsUrl = `${filBleuUrl}/mes-cartes`;

async function downloadFileAt(page, downloadLink, pdfFilePath) {
  await page.setRequestInterception(true);

  const interceptedRequest = await new Promise(resolve => {
    page.goto(downloadLink).catch(err => {
      if (err.message.indexOf('net::ERR_FAILED') !== -1) {
        return;
      }
      throw err;
    });

    page.on('request', request => {
      request.abort();
      resolve(request);
    });
  });

  const cookies = await page.cookies();
  const headers = interceptedRequest._headers;
  headers.Cookie = cookies
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join(';');

  const writer = fs.createWriteStream(pdfFilePath);
  const response = await axios.get(interceptedRequest._url, {
    headers,
    responseType: 'stream'
  });
  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// Download and writes the PDF in current script directory
async function downloadPdf(pdfFilePath) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(filBleuUrl);

  // Connection
  const { username, password } = getConfig();
  await page.type('input#username', username);
  await page.type('input#password', password);
  await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]')
  ]);

  // Go to documents page and download last document
  await page.goto(filBleuDocumentsUrl, { waitUntil: 'domcontentloaded' });
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: __dirname
  });

  const href = await page.evaluate(() => {
    return document.querySelector('.attestation.bloc a:first-child').href;
  });
  await downloadFileAt(page, href, pdfFilePath);
  console.log(`PDF file downloaded at ${pdfFilePath}`);

  // Close browser
  await browser.close();
}

module.exports = { downloadPdf };
