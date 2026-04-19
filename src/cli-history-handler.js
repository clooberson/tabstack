const { readSessions, writeSessions } = require('./storage');

function addToHistory(session, url) {
  if (!session.history) session.history = [];
  session.history.push({ url, addedAt: new Date().toISOString() });
  return session;
}

function getHistory(session) {
  return session.history || [];
}

function clearHistory(session) {
  session.history = [];
  return session;
}

function registerHistoryCommand(program) {
  const history = program.command('history').description('Manage URL history for a session');

  history
    .command('list <name>')
    .description('List URL history for a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const session = sessions[name];
      if (!session) return console.error(`Session "${name}" not found.`);
      const h = getHistory(session);
      if (h.length === 0) return console.log('No history.');
      h.forEach((entry, i) => console.log(`${i + 1}. [${entry.addedAt}] ${entry.url}`));
    });

  history
    .command('clear <name>')
    .description('Clear URL history for a session')
    .action(async (name) => {
      const sessions = await readSessions();
      if (!sessions[name]) return console.error(`Session "${name}" not found.`);
      sessions[name] = clearHistory(sessions[name]);
      await writeSessions(sessions);
      console.log(`History cleared for "${name}".`);
    });
}

module.exports = { addToHistory, getHistory, clearHistory, registerHistoryCommand };
