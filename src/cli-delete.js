const { deleteSession, listSessions } = require('./storage');

function registerDeleteCommand(program) {
  program
    .command('delete <name>')
    .description('delete a saved session')
    .option('-f, --force', 'skip confirmation prompt')
    .action(async (name, options) => {
      const sessions = listSessions();
      if (!sessions.includes(name)) {
        console.error(`Session "${name}" not found.`);
        process.exit(1);
      }

      if (!options.force) {
        const confirmed = await confirm(`Delete session "${name}"? (y/N) `);
        if (!confirmed) {
          console.log('Aborted.');
          return;
        }
      }

      deleteSession(name);
      console.log(`Session "${name}" deleted.`);
    });
}

async function confirm(prompt) {
  const readline = require('readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

module.exports = { registerDeleteCommand };
