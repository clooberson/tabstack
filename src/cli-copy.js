const { getSession, saveSession } = require('./storage');

function registerCopyCommand(program) {
  program
    .command('copy <source> <destination>')
    .description('copy a session to a new name')
    .action(async (source, destination) => {
      try {
        const session = await getSession(source);
        if (!session) {
          console.error(`Session '${source}' not found`);
          process.exit(1);
        }

        const existing = await getSession(destination);
        if (existing) {
          console.error(`Session '${destination}' already exists`);
          process.exit(1);
        }

        await saveSession(destination, session.urls);
        console.log(`Copied session '${source}' to '${destination}' (${session.urls.length} tabs)`);
      } catch (err) {
        console.error('Failed to copy session:', err.message);
        process.exit(1);
      }
    });
}

module.exports = { registerCopyCommand };
