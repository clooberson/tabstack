const { getSession, writeSessions, readSessions } = require('./storage');

function setExpiry(sessions, name, date) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  const ts = new Date(date).getTime();
  if (isNaN(ts)) throw new Error(`Invalid date: "${date}"`);
  session.expiresAt = ts;
  return sessions;
}

function clearExpiry(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.expiresAt;
  return sessions;
}

function listExpired(sessions) {
  const now = Date.now();
  return Object.entries(sessions)
    .filter(([, s]) => s.expiresAt && s.expiresAt <= now)
    .map(([name, s]) => ({ name, expiresAt: s.expiresAt }));
}

function registerExpireCommand(program) {
  const expire = program.command('expire').description('Manage session expiry');

  expire
    .command('set <name> <date>')
    .description('Set expiry date for a session (e.g. 2025-12-31)')
    .action(async (name, date) => {
      const sessions = await readSessions();
      const updated = setExpiry(sessions, name, date);
      await writeSessions(updated);
      console.log(`Expiry set for "${name}": ${new Date(updated[name].expiresAt).toISOString()}`);
    });

  expire
    .command('clear <name>')
    .description('Clear expiry date for a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const updated = clearExpiry(sessions, name);
      await writeSessions(updated);
      console.log(`Expiry cleared for "${name}"`);
    });

  expire
    .command('list')
    .description('List all expired sessions')
    .action(async () => {
      const sessions = await readSessions();
      const expired = listExpired(sessions);
      if (expired.length === 0) {
        console.log('No expired sessions.');
      } else {
        expired.forEach(({ name, expiresAt }) => {
          console.log(`${name} — expired at ${new Date(expiresAt).toISOString()}`);
        });
      }
    });
}

module.exports = { setExpiry, clearExpiry, listExpired, registerExpireCommand };
