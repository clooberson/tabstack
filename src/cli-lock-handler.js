const { getSession, writeSessions, readSessions } = require('./storage');

function lockSession(name, password) {
  const sessions = readSessions();
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  if (session.locked) throw new Error(`Session "${name}" is already locked`);
  // simple flag-based lock, password stored as hint only (not secure, just UX guard)
  sessions[name] = { ...session, locked: true, lockHint: password ? '(password set)' : undefined };
  writeSessions(sessions);
  return sessions[name];
}

function unlockSession(name) {
  const sessions = readSessions();
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  if (!session.locked) throw new Error(`Session "${name}" is not locked`);
  const { locked, lockHint, ...rest } = session;
  sessions[name] = rest;
  writeSessions(sessions);
  return sessions[name];
}

function registerLockCommand(program) {
  program
    .command('lock <name>')
    .description('lock a session to prevent accidental deletion or modification')
    .option('-p, --password <password>', 'optional password hint')
    .action((name, opts) => {
      try {
        lockSession(name, opts.password);
        console.log(`Session "${name}" locked.`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  program
    .command('unlock <name>')
    .description('unlock a previously locked session')
    .action((name) => {
      try {
        unlockSession(name);
        console.log(`Session "${name}" unlocked.`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
}

module.exports = { lockSession, unlockSession, registerLockCommand };
