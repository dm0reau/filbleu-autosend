#!/usr/bin/node

const fs = require('fs');
const { downloadPdf } = require('./lib/browser');
const { sendMail } = require('./lib/mail');

// PDF file path
const pdfFilePath = `${__dirname}/Attestation.pdf`;

// Deletes PDF file
async function deletePdf(pdfFilePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(pdfFilePath, err => {
      if (!err) {
        resolve();
        console.log(`${pdfFilePath} deleted`);
      }
      reject(err);
    });
  });
}

// Main entry point
async function main() {
  await downloadPdf(pdfFilePath);
  await sendMail(pdfFilePath);
  await deletePdf(pdfFilePath);
}

main();
