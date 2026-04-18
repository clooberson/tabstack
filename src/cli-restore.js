import { Command } from 'commander';
import { restoreSession, validateBrowser } from './restore.js';
import { getSession } from './storage.js';
import { getSupportedBrowsers } from './browser.js';

/**
 * Register the restore command on a Commander program.
 * @param {import('commander').Command} program
 */
export function registerRestoreCommand(program) {
  program
    .command('restore <name>')
    .description('Restore a saved tab session in a browser')
    .option(
      '-b, --browser <browser>',
      `browser to use (${getSupportedBrowsers().join(', ')})`,
      'chrome'
    )
    .action(async (name, options) => {
      const { browser } = options;

      const validationError = validateBrowser(browser);
      if (validationError) {
        console.error(`Error: ${validationError}`);
        process.exit(1);
      }

      const session = await getSession(name);
      if (!session) {
        console.error(`Error: session "${name}" not found`);
        process.exit(1);
      }

      try {
        await restoreSession(session, browser);
        console.log(
          `Restored session "${name}" with ${session.urls.length} tab(s) in ${browser}`
        );
      } catch (err) {
        console.error(`Error restoring session: ${err.message}`);
        process.exit(1);
      }
    });
}
