const { getSession, writeSessions, readSessions } = require('./storage');

const ACCESS_LEVELS = ['public', 'private', 'restricted'];

function setAccessLevel(sessions, name, level) {
  if (!ACCESS_LEVELS.includes(level)) {
    throw new Error(`Invalid access level "${level}". Must be one of: ${ACCESS_LEVELS.join(', ')}`);
  }
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.accessLevel = level;
  return sessions;
}

function getAccessLevel(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.accessLevel || 'public';
}

function listByAccess(sessions, level) {
  if (!ACCESS_LEVELS.includes(level)) {
    throw new Error(`Invalid access level "${level}". Must be one of: ${ACCESS_LEVELS.join(', ')}`);
  }
  return Object.entries(sessions)
    .filter(([, s]) => (s.accessLevel || 'public') === level)
    .map(([name]) => name);
}

function registerAccessCommand(program) {
  const access = program.command('access').description('Manage session access levels');

  access
    .command('set <name> <level>')
    .description(`Set access level for a session (${ACCESS_LEVELS.join('|')})`)
    .action(async (name, level) => {
      try {
        const sessions = await readSessions();
        const updated = setAccessLevel(sessions, name, level);
        await writeSessions(updated);
        console.log(`Access level for "${name}" set to "${level}"`);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  access
    .command('get <name>')
    .description('Get access level of a session')
    .action(async (name) => {
      try {
        const sessions = await readSessions();
        const level = getAccessLevel(sessions, name);
        console.log(`${name}: ${level}`);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  access
    .command('list <level>')
    .description('List sessions with a given access level')
    .action(async (level) => {
      try {
        const sessions = await readSessions();
        const names = listByAccess(sessions, level);
        if (names.length === 0) {
          console.log(`No sessions with access level "${level}"`);
        } else {
          names.forEach((n) => console.log(n));
        }
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });
}

module.exports = { setAccessLevel, getAccessLevel, listByAccess, registerAccessCommand };
