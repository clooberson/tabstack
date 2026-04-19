const { readSessions } = require('./storage');

function getRecentSessions(sessions, limit = 5) {
  return Object.entries(sessions)
    .map(([name, session]) => ({ name, ...session }))
    .filter(s => s.savedAt)
    .sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
    .slice(0, limit);
}

function registerRecentCommand(program) {
  program
    .command('recent')
    .description('show recently saved sessions')
    .option('-n, --limit <number>', 'number of sessions to show', '5')
    .option('--json', 'output as JSON')
    .action(async (options) => {
      const sessions = await readSessions();
      const limit = parseInt(options.limit, 10);

      if (isNaN(limit) || limit < 1) {
        console.error('Error: limit must be a positive number');
        process.exit(1);
      }

      const recent = getRecentSessions(sessions, limit);

      if (recent.length === 0) {
        console.log('No sessions found.');
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(recent, null, 2));
        return;
      }

      recent.forEach((session, i) => {
        const date = new Date(session.savedAt).toLocaleString();
        const urlCount = (session.urls || []).length;
        console.log(`${i + 1}. ${session.name} — ${urlCount} tab(s) — saved ${date}`);
      });
    });
}

module.exports = { getRecentSessions, registerRecentCommand };
