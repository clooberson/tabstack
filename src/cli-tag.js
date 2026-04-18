import { getSession, writeSessions, readSessions } from './storage.js';

export function registerTagCommand(program) {
  program
    .command('tag <session> [tags...]')
    .description('add tags to a session')
    .option('-r, --remove', 'remove the specified tags instead of adding')
    .option('-l, --list', 'list tags for the session')
    .action((sessionName, tags, options) => {
      const sessions = readSessions();
      const session = getSession(sessions, sessionName);

      if (!session) {
        console.error(`Session "${sessionName}" not found.`);
        process.exit(1);
      }

      if (options.list) {
        const currentTags = session.tags || [];
        if (currentTags.length === 0) {
          console.log(`No tags for session "${sessionName}".`);
        } else {
          console.log(`Tags for "${sessionName}": ${currentTags.join(', ')}`);
        }
        return;
      }

      if (!tags || tags.length === 0) {
        console.error('Please provide at least one tag.');
        process.exit(1);
      }

      session.tags = session.tags || [];

      if (options.remove) {
        session.tags = session.tags.filter(t => !tags.includes(t));
        console.log(`Removed tags from "${sessionName}": ${tags.join(', ')}`);
      } else {
        const newTags = tags.filter(t => !session.tags.includes(t));
        session.tags.push(...newTags);
        console.log(`Added tags to "${sessionName}": ${newTags.join(', ')}`);
      }

      writeSessions(sessions);
    });
}
