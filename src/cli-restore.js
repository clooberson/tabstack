const { restoreSession } = require('./restore');
const { getSupportedBrowsers } = require('./browser');

function registerRestoreCommand(program) {
  program
    .command('restore <name>')
    .description('restore a saved tab session in your browser')
    .option(
      '-b, --browser <browser>',
      `browser to use (${getSupportedBrowsers().join(', ')})`,
      'chrome'
    )
    .option('--dry-run', 'print URLs without opening them', false)
    .action((name, options) => {
      try {
        const urls = restoreSession(name, {
          browser: options.browser,
          dryRun: options.dryRun
        });
        if (!options.dryRun && urls.length > 0) {
          console.log(`✓ Opened ${urls.length} tab(s) from session "${name}".`);
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}

module.exports = { registerRestoreCommand };
