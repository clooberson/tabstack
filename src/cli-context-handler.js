const { readSessions, writeSessions } = require('./storage');

function setContext(sessions, name, context) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.context = context;
  session.updatedAt = new Date().toISOString();
  return sessions;
}

function removeContext(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.context;
  session.updatedAt = new Date().toISOString();
  return sessions;
}

function getContext(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.context || null;
}

function listByContext(sessions, context) {
  return Object.entries(sessions)
    .filter(([, s]) => s.context === context)
    .map(([name, s]) => ({ name, ...s }));
}

function registerContextCommand(program) {
  const ctx = program
    .command('context')
    .description('manage session context tags');

  ctx
    .command('set <session> <context>')
    .description('set context for a session')
    .action(async (name, context) => {
      const sessions = await readSessions();
      const updated = setContext(sessions, name, context);
      await writeSessions(updated);
      console.log(`Context "${context}" set for session "${name}".`);
    });

  ctx
    .command('remove <session>')
    .description('remove context from a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const updated = removeContext(sessions, name);
      await writeSessions(updated);
      console.log(`Context removed from session "${name}".`);
    });

  ctx
    .command('get <session>')
    .description('get context for a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const context = getContext(sessions, name);
      console.log(context ? `Context: ${context}` : `No context set for "${name}".`);
    });

  ctx
    .command('list <context>')
    .description('list sessions with a given context')
    .action(async (context) => {
      const sessions = await readSessions();
      const matches = listByContext(sessions, context);
      if (matches.length === 0) {
        console.log(`No sessions found with context "${context}".`);
      } else {
        matches.forEach(s => console.log(`  ${s.name} (${(s.urls || []).length} urls)`));
      }
    });
}

module.exports = { setContext, removeContext, getContext, listByContext, registerContextCommand };
