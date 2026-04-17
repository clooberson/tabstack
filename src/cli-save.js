const { saveSession } = require('./storage');

/**
 * Register the 'save' command with the CLI program.
 * @param {import('commander').Command} program
 */
function registerSaveCommand(program) {
  program
    .command('save <name>')
    .description('Save a list of URLs as a named session')
    .argument('<urls...>', 'One or more URLs to save')
    .option('-f, --force', 'Overwrite existing session with the same name')
    .action((name, urls, options) => {
      // urls come after name in commander when using variadic args
      // commander passes extra args as the second positional
      const urlList = Array.isArray(urls) ? urls : [urls];

      if (!urlList.length) {
        console.error('Error: at least one URL is required.');
        process.exit(1);
      }

      const invalid = urlList.filter((u) => {
        try {
          new URL(u);
          return false;
        } catch {
          return true;
        }
      });

      if (invalid.length) {
        console.error(`Error: invalid URL(s): ${invalid.join(', ')}`);
        process.exit(1);
      }

      try {
        const session = saveSession(name, urlList, options.force);
        console.log(`Session "${session.name}" saved with ${session.urls.length} tab(s).`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}

module.exports = { registerSaveCommand };
