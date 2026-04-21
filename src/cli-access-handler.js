const { readSessions, writeSessions } = require('./storage');

const VALID_LEVELS = ['public', 'private', 'restricted'];

function setAccessLevel(sessions, name, level) {
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid access level "${level}". Must be one of: ${VALID_LEVELS.join(', ')}`);
  }
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.access = level;
  return session;
}

function getAccessLevel(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.access || 'public';
}

function listByAccess(sessions, level) {
  if (!VALID_LEVELS.includes(level)) {
    throw new Error(`Invalid access level "${level}". Must be one of: ${VALID_LEVELS.join(', ')}`);
  }
  return Object.entries(sessions)
    .filter(([, s]) => (s.access || 'public') === level)
    .map(([name]) => name);
}

function registerAccessCommand(program) {
  const access = program
    .command('access')
    .description('Manage session access levels (public, private, restricted)');

  access
    .command('set <session> <level>')
    .description('Set access level for a session')
    .action(async (name, level) => {
      const sessions = await readSessions();
      setAccessLevel(sessions, name, level);
      await writeSessions(sessions);
      console.log(`Access level for "${name}" set to "${level}"`);
    });

  access
    .command('get <session>')
    .description('Get access level for a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const level = getAccessLevel(sessions, name);
      console.log(`${name}: ${level}`);
    });

  access
    .command('list <level>')
    .description('List sessions by access level')
    .action(async (level) => {
      const sessions = await readSessions();
      const names = listByAccess(sessions, level);
      if (names.length === 0) {
        console.log(`No sessions with access level "${level}"`);
      } else {
        names.forEach((n) => console.log(n));
      }
    });
}

module.exports = { setAccessLevel, getAccessLevel, listByAccess, registerAccessCommand };
