const fs = require('fs');
const configFilePath = `${__dirname}/../config.json`;

function getConfig() {
  if (!fs.existsSync(configFilePath)) {
    console.log(
      "ERROR: config.json doesn't exists! You can take config-sample.json for example."
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configFilePath));
}

module.exports = { getConfig };
