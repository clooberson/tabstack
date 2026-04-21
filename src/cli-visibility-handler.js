const { readSessions, writeSessions } = require('./storage');

function setVisibility(sessions, name, visibility) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  const valid = ['public', 'private', 'hidden'];
  if (!valid.includes(visibility)) {
    throw new Error(`Invalid visibility "${visibility}". Must be one of: ${valid.join(', ')}`);
  }
  session.visibility = visibility;
  return session;
}

function getVisibility(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.visibility || 'public';
}

function listByVisibility(sessions, visibility) {
  return Object.entries(sessions)
    .filter(([, s]) => (s.visibility || 'public') === visibility)
    .map(([name, s]) => ({ name, ...s }));
}

function registerVisibilityCommand(program) {
  const cmd = program.command('visibility').description('Manage session visibility');

  cmd
    .command('set <session> <visibility>')
    .description('Set visibility of a session (public, private, hidden)')
    .action(async (name, visibility) => {
      const sessions = await readSessions();
      setVisibility(sessions, name, visibility);
      await writeSessions(sessions);
      console.log(`Session "${name}" visibility set to "${visibility}"`);
    });

  cmd
    .command('get <session>')
    .description('Get visibility of a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const v = getVisibility(sessions, name);
      console.log(`${name}: ${v}`);
    });

  cmd
    .command('list <visibility>')
    .description('List sessions with a given visibility')
    .action(async (visibility) => {
      const sessions = await readSessions();
      const results = listByVisibility(sessions, visibility);
      if (results.length === 0) {
        console.log(`No sessions with visibility "${visibility}"`);
      } else {
        results.forEach(s => console.log(`- ${s.name}`));
      }
    });
}

module.exports = { setVisibility, getVisibility, listByVisibility, registerVisibilityCommand };
