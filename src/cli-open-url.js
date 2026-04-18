import { registerRestoreCommand } from './restore.js';
import { getSupportedBrowsers, openUrls } from './browser.js';
import { validateBrowser } from './restore.js';

export function registerOpenUrlCommand(program) {
  program
    .command('open-url <url...>')
    .description('open one or more URLs directly in a browser')
    .option('-b, --browser <browser>', 'browser to use')
    .option('-n, --new-window', 'open in a new window (if supported)')
    .action(async (urls, options) => {
      const browser = options.browser || null;

      if (browser) {
        const err = validateBrowser(browser);
        if (err) {
          console.error(`Error: ${err}`);
          process.exit(1);
        }
      }

      const validUrls = urls.filter(u => {
        try {
          new URL(u);
          return true;
        } catch {
          console.warn(`Skipping invalid URL: ${u}`);
          return false;
        }
      });

      if (validUrls.length === 0) {
        console.error('Error: no valid URLs provided');
        process.exit(1);
      }

      try {
        await openUrls(validUrls, browser);
        console.log(`Opened ${validUrls.length} URL(s)${browser ? ` in ${browser}` : ''}`);
      } catch (err) {
        console.error(`Failed to open URLs: ${err.message}`);
        process.exit(1);
      }
    });
}
