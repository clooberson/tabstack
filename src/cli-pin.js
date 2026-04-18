import { readSessions, writeSessions } from './storage.js';

export function registerPinCommand(program) {
  program
    .command('pin <name>')
    .description('pin or unpin a session so it appears at the top of lists')
    .option('--unpin', 'remove pin from session')
    .action(async (name, options) => {
      const sessions = await readSessions();

      if (!sessions[name]) {
        console.error(`Session "${name}" not found.`);
        process.exit(1);
      }

      if (options.unpin) {
        delete sessions[name].pinned;
        await writeSessions(sessions);
        console.log(`Unpinned session "${name}".`);
      } else {
        sessions[name].pinned = true;
        await writeSessions(sessions);
        console.log(`Pinned session "${name}".`);
      }
    });
}
