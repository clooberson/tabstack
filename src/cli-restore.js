const { validateBrowser, restoreSession } = require('./restore');
const { getSession } = require('./storage');

function registerRestoreCommand(program) {
  program
    .command('restore <name>')
    .description('restore a saved tab session in a browser')
    .option('-b, --browser <browser>', 'browser to open tabs in', 'chrome')
    .action(async (name, options) => {
      try {
        const browserError = validateBrowser(options.browser);
        if (browserError) {
          console.error(`Error: ${browserError}`);
          process.exit(1);
        }

        const session = getSession(name);
        if (!session) {
          console.error(`Error: session "${name}" not found`);
          process.exit(1);
        }

        await restoreSession(session, options.browser);
        console.log(`Restored session "${name}" (${session.urls.length} tabs) in ${options.browser}`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}

module.exports = { registerRestoreCommand };
