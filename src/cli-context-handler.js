const { readSessions, writeSessions } = require('./storage');

function setContext(sessions, name, context) {
  if (!sessions[name]) throw new Error(`Session "${name}" not found`);
  sessions[name].context = context;
  return sessions;
}

function removeContext(sessions, name) {
  if (!sessions[name]) throw new Error(`Session "${name}" not found`);
  delete sessions[name].context;
  return sessions;
}

function getContext(sessions, name) {
  if (!sessions[name]) throw new Error(`Session "${name}" not found`);
  return sessions[name].context || null;
}

function listByContext(sessions, context) {
  return Object.entries(sessions)
    .filter(([, s]) => s.context === context)
    .map(([name, s]) => ({ name, ...s }));
}

function registerContextCommand(program) {
  const ctx = program.command('context').description('manage session contexts');

  ctx
    .command('set <session> <context>')
    .description('set context for a session')
    .action(async (session, context) => {
      const sessions = await readSessions();
      const updated = setContext(sessions, session, context);
      await writeSessions(updated);
      console.log(`Context "${context}" set for session "${session}"`);
    });

  ctx
    .command('remove <session>')
    .description('remove context from a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const updated = removeContext(sessions, session);
      await writeSessions(updated);
      console.log(`Context removed from session "${session}"`);
    });

  ctx
    .command('get <session>')
    .description('get context for a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const context = getContext(sessions, session);
      console.log(context ? `Context: ${context}` : 'No context set');
    });

  ctx
    .command('list <context>')
    .description('list sessions by context')
    .action(async (context) => {
      const sessions = await readSessions();
      const results = listByContext(sessions, context);
      if (results.length === 0) {
        console.log(`No sessions found with context "${context}"`);
      } else {
        results.forEach((s) => console.log(`  ${s.name} (${s.urls.length} tabs)`));
      }
    });
}

module.exports = { setContext, removeContext, getContext, listByContext, registerContextCommand };
