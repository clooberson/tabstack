const { readSessions, writeSessions } = require('./storage');

const MAX_HISTORY = 50;

async function addToHistory(sessionName) {
  const data = await readSessions();
  if (!data._history) data._history = [];
  data._history = data._history.filter(e => e.name !== sessionName);
  data._history.unshift({ name: sessionName, accessedAt: new Date().toISOString() });
  if (data._history.length > MAX_HISTORY) data._history = data._history.slice(0, MAX_HISTORY);
  await writeSessions(data);
}

async function getHistory(limit = 10) {
  const data = await readSessions();
  return (data._history || []).slice(0, limit);
}

async function clearHistory() {
  const data = await readSessions();
  data._history = [];
  await writeSessions(data);
}

function registerHistoryCommand(program) {
  const cmd = program.command('history').description('View or manage session access history');

  cmd
    .command('list')
    .description('List recently accessed sessions')
    .option('-n, --limit <number>', 'Number of entries to show', '10')
    .action(async (opts) => {
      const limit = parseInt(opts.limit, 10);
      const history = await getHistory(limit);
      if (!history.length) {
        console.log('No history found.');
        return;
      }
      history.forEach((e, i) => {
        console.log(`${i + 1}. ${e.name} — ${new Date(e.accessedAt).toLocaleString()}`);
      });
    });

  cmd
    .command('clear')
    .description('Clear session access history')
    .action(async () => {
      await clearHistory();
      console.log('History cleared.');
    });
}

module.exports = { addToHistory, getHistory, clearHistory, registerHistoryCommand };
