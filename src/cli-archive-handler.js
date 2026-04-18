import { getSession, writeSessions, readSessions } from './storage.js';

export function archiveSession(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return {
    ...sessions,
    [name]: { ...session, archived: true, archivedAt: new Date().toISOString() },
  };
}

export function unarchiveSession(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  const updated = { ...session, archived: false };
  delete updated.archivedAt;
  return { ...sessions, [name]: updated };
}

export function registerArchiveCommand(program) {
  const archive = program.command('archive').description('archive or unarchive sessions');

  archive
    .command('add <name>')
    .description('archive a session')
    .action(async (name) => {
      try {
        const sessions = await readSessions();
        const updated = archiveSession(sessions, name);
        await writeSessions(updated);
        console.log(`Session "${name}" archived.`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  archive
    .command('remove <name>')
    .description('unarchive a session')
    .action(async (name) => {
      try {
        const sessions = await readSessions();
        const updated = unarchiveSession(sessions, name);
        await writeSessions(updated);
        console.log(`Session "${name}" unarchived.`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  archive
    .command('list')
    .description('list archived sessions')
    .action(async () => {
      const sessions = await readSessions();
      const archived = Object.entries(sessions).filter(([, s]) => s.archived);
      if (archived.length === 0) {
        console.log('No archived sessions.');
        return;
      }
      archived.forEach(([name, s]) => {
        console.log(`${name} (archived: ${s.archivedAt})`);
      });
    });
}
