const { readSessions, writeSessions } = require('./storage');

const VALID_VISIBILITIES = ['public', 'private', 'hidden'];

function setVisibility(sessions, name, visibility) {
  if (!VALID_VISIBILITIES.includes(visibility)) {
    throw new Error(`Invalid visibility "${visibility}". Must be one of: ${VALID_VISIBILITIES.join(', ')}`);
  }
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.visibility = visibility;
  return sessions;
}

function getVisibility(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.visibility || 'public';
}

function listByVisibility(sessions, visibility) {
  if (!VALID_VISIBILITIES.includes(visibility)) {
    throw new Error(`Invalid visibility "${visibility}". Must be one of: ${VALID_VISIBILITIES.join(', ')}`);
  }
  return Object.entries(sessions)
    .filter(([, s]) => (s.visibility || 'public') === visibility)
    .map(([name]) => name);
}

function registerVisibilityCommand(program) {
  const vis = program
    .command('visibility')
    .description('manage session visibility');

  vis
    .command('set <session> <visibility>')
    .description('set visibility for a session (public, private, hidden)')
    .action(async (name, visibility) => {
      try {
        const sessions = await readSessions();
        const updated = setVisibility(sessions, name, visibility);
        await writeSessions(updated);
        console.log(`Set visibility of "${name}" to "${visibility}"`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  vis
    .command('get <session>')
    .description('get visibility of a session')
    .action(async (name) => {
      try {
        const sessions = await readSessions();
        const v = getVisibility(sessions, name);
        console.log(`${name}: ${v}`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  vis
    .command('list <visibility>')
    .description('list sessions by visibility')
    .action(async (visibility) => {
      try {
        const sessions = await readSessions();
        const names = listByVisibility(sessions, visibility);
        if (names.length === 0) {
          console.log(`No sessions with visibility "${visibility}"`);
        } else {
          names.forEach((n) => console.log(n));
        }
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
}

module.exports = { setVisibility, getVisibility, listByVisibility, registerVisibilityCommand };
