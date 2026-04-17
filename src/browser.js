const { execSync } = require('child_process');
const os = require('os');

const BROWSERS = {
  chrome: {
    mac: 'Google Chrome',
    linux: 'google-chrome',
    win: 'chrome'
  },
  firefox: {
    mac: 'Firefox',
    linux: 'firefox',
    win: 'firefox'
  },
  brave: {
    mac: 'Brave Browser',
    linux: 'brave-browser',
    win: 'brave'
  }
};

function getPlatform() {
  const p = os.platform();
  if (p === 'darwin') return 'mac';
  if (p === 'win32') return 'win';
  return 'linux';
}

function openUrls(urls, browser = 'chrome') {
  const platform = getPlatform();
  const browserDefs = BROWSERS[browser];
  if (!browserDefs) throw new Error(`Unsupported browser: ${browser}`);
  const browserName = browserDefs[platform];

  urls.forEach(url => {
    try {
      if (platform === 'mac') {
        execSync(`open -a "${browserName}" "${url}"`);
      } else if (platform === 'linux') {
        execSync(`${browserName} "${url}" &`);
      } else {
        execSync(`start ${browserName} "${url}"`);
      }
    } catch (err) {
      console.error(`Failed to open ${url}: ${err.message}`);
    }
  });
}

function getSupportedBrowsers() {
  return Object.keys(BROWSERS);
}

module.exports = { openUrls, getSupportedBrowsers, getPlatform };
