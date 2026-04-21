const { readSessions, writeSessions } = require('./storage');

const VALID_VISIBILITIES = ['public', 'private', 'hidden'];

function setVisibility(sessions, name, visibility) {
  if (!VALID_VISIBILITIES.includes(visibility)) {
    throw new Error(`Invalid visibility "${visibility}". Choose from: ${VALID_VISIBILITIES.join(', ')}`);
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
    throw new Error(`Invalid visibility "${visibility}". Choose from: ${VALID_VISIBILITIES.join(', ')}`);
  }
  return Object.entries(sessions)
    .filter(([, s]) => (s.visibility || 'public') === visibility)
    .map(([name]) => name);
}

function registerVisibilityCommand(program) {
  const vis = program.command('visibility').description('Manage session visibility');

  vis
    .command('set <session> <visibility>')
    .description('Set visibility of a session (public, private, hidden)')
    .action(async (session, visibility) => {
      const sessions = await readSessions();
      const updated = setVisibility(sessions, session, visibility);
      await writeSessions(updated);
      console.log(`Set visibility of "${session}" to "${visibility}"`);
    });

  vis
    .command('get <session>')
    .description('Get visibility of a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const v = getVisibility(sessions, session);
      console.log(`"${session}" visibility: ${v}`);
    });

  vis
    .command('list <visibility>')
    .description('List sessions with a given visibility')
    .action(async (visibility) => {
      const sessions = await readSessions();
      const names = listByVisibility(sessions, visibility);
      if (names.length === 0) {
        console.log(`No sessions with visibility "${visibility}"`);
      } else {
        names.forEach((n) => console.log(n));
      }
    });
}

module.exports = { setVisibility, getVisibility, listByVisibility, registerVisibilityCommand };
