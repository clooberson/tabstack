const { getSession, writeSessions, readSessions } = require('./storage');

function pinSession(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.pinned = true;
  return sessions;
}

function unpinSession(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.pinned = false;
  return sessions;
}

function listPinned(sessions) {
  return Object.entries(sessions)
    .filter(([, s]) => s.pinned === true)
    .map(([name, s]) => ({ name, urls: s.urls, tags: s.tags || [] }));
}

function registerPinHandlerCommand(program) {
  const pin = program.command('pin').description('Pin or unpin sessions');

  pin
    .command('add <name>')
    .description('Pin a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const updated = pinSession(sessions, name);
      await writeSessions(updated);
      console.log(`Pinned session "${name}"`);
    });

  pin
    .command('remove <name>')
    .description('Unpin a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const updated = unpinSession(sessions, name);
      await writeSessions(updated);
      console.log(`Unpinned session "${name}"`);
    });

  pin
    .command('list')
    .description('List all pinned sessions')
    .action(async () => {
      const sessions = await readSessions();
      const pinned = listPinned(sessions);
      if (pinned.length === 0) {
        console.log('No pinned sessions.');
      } else {
        pinned.forEach(({ name, urls }) => {
          console.log(`📌 ${name} (${urls.length} url${urls.length !== 1 ? 's' : ''})`);
        });
      }
    });
}

module.exports = { pinSession, unpinSession, listPinned, registerPinHandlerCommand };
