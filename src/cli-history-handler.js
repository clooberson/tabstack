const { readSessions, writeSessions } = require('./storage');

const MAX_HISTORY = 50;

function recordHistory(sessionName, action, meta = {}) {
  const data = readSessions();
  if (!data._history) data._history = [];
  data._history.unshift({
    sessionName,
    action,
    timestamp: new Date().toISOString(),
    ...meta,
  });
  if (data._history.length > MAX_HISTORY) {
    data._history = data._history.slice(0, MAX_HISTORY);
  }
  writeSessions(data);
}

function getHistory(limit = 20) {
  const data = readSessions();
  return (data._history || []).slice(0, limit);
}

function clearHistory() {
  const data = readSessions();
  data._history = [];
  writeSessions(data);
}

function registerHistoryCommand(program) {
  program
    .command('history')
    .description('Show recent session activity history')
    .option('-n, --limit <number>', 'Number of entries to show', '20')
    .option('--clear', 'Clear history')
    .action((opts) => {
      if (opts.clear) {
        clearHistory();
        console.log('History cleared.');
        return;
      }
      const limit = parseInt(opts.limit, 10);
      const entries = getHistory(limit);
      if (entries.length === 0) {
        console.log('No history found.');
        return;
      }
      entries.forEach((e) => {
        const meta = Object.keys(e)
          .filter((k) => !['sessionName', 'action', 'timestamp'].includes(k))
          .map((k) => `${k}=${e[k]}`)
          .join(' ');
        console.log(`[${e.timestamp}] ${e.action} "${e.sessionName}"${meta ? ' ' + meta : ''}`);
      });
    });
}

module.exports = { recordHistory, getHistory, clearHistory, registerHistoryCommand };
