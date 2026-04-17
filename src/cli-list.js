const { listSessions, deleteSession } = require('./storage');

function registerListCommand(program) {
  program
    .command('list')
    .description('list all saved tab sessions')
    .option('-d, --delete <name>', 'delete a session by name')
    .action((options) => {
      if (options.delete) {
        const deleted = deleteSession(options.delete);
        if (deleted) {
          console.log(`Session "${options.delete}" deleted.`);
        } else {
          console.error(`Session "${options.delete}" not found.`);
          process.exit(1);
        }
        return;
      }

      const sessions = listSessions();
      if (sessions.length === 0) {
        console.log('No saved sessions.');
        return;
      }

      console.log(`Found ${sessions.length} session(s):\n`);
      sessions.forEach((session) => {
        const tabCount = session.urls.length;
        const saved = new Date(session.savedAt).toLocaleString();
        console.log(`  ${session.name} — ${tabCount} tab(s), saved ${saved}`);
      });
    });
}

module.exports = { registerListCommand };
