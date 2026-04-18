const { renameSession, listSessions } = require('./storage');

function registerRenameCommand(program) {
  program
    .command('rename <oldName> <newName>')
    .description('rename a saved session')
    .action((oldName, newName) => {
      const sessions = listSessions();

      if (!sessions.includes(oldName)) {
        console.error(`Session "${oldName}" not found.`);
        process.exit(1);
      }

      if (sessions.includes(newName)) {
        console.error(`Session "${newName}" already exists. Use --force to overwrite.`);
        process.exit(1);
      }

      renameSession(oldName, newName);
      console.log(`Session "${oldName}" renamed to "${newName}".`);
    });
}

module.exports = { registerRenameCommand };
