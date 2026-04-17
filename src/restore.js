const { getSession } = require('./storage');
const { openUrls, getSupportedBrowsers } = require('./browser');

function validateBrowser(browser) {
  const supported = getSupportedBrowsers();
  if (!supported.includes(browser)) {
    throw new Error(
      `Unknown browser "${browser}". Supported: ${supported.join(', ')}`
    );
  }
}

function restoreSession(name, options = {}) {
  const { browser = 'chrome', dryRun = false } = options;

  validateBrowser(browser);

  const session = getSession(name);
  if (!session) {
    throw new Error(`Session "${name}" not found.`);
  }

  const { urls } = session;
  if (!urls || urls.length === 0) {
    console.log(`Session "${name}" has no URLs to restore.`);
    return [];
  }

  if (dryRun) {
    console.log(`[dry-run] Would open ${urls.length} tab(s) in ${browser}:`);
    urls.forEach(u => console.log(`  ${u}`));
    return urls;
  }

  console.log(`Restoring ${urls.length} tab(s) from "${name}" in ${browser}...`);
  openUrls(urls, browser);
  return urls;
}

module.exports = { restoreSession };
