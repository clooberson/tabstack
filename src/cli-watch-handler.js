const { readSessions, writeSessions } = require('./storage');

const DEFAULT_INTERVAL = 5000;

function formatChange(type, name) {
  const icons = { added: '✚', removed: '✖', changed: '~' };
  return `  ${icons[type] || '?'} [${type}] ${name}`;
}

function diffSessionSets(prev, curr) {
  const changes = [];
  const prevNames = new Set(Object.keys(prev));
  const currNames = new Set(Object.keys(curr));

  for (const name of currNames) {
    if (!prevNames.has(name)) {
      changes.push({ type: 'added', name });
    } else {
      const prevUrls = JSON.stringify(prev[name].urls);
      const currUrls = JSON.stringify(curr[name].urls);
      if (prevUrls !== currUrls) {
        changes.push({ type: 'changed', name });
      }
    }
  }

  for (const name of prevNames) {
    if (!currNames.has(name)) {
      changes.push({ type: 'removed', name });
    }
  }

  return changes;
}

function registerWatchCommand(program) {
  program
    .command('watch')
    .description('watch for session changes in real time')
    .option('-i, --interval <ms>', 'polling interval in milliseconds', String(DEFAULT_INTERVAL))
    .option('-s, --session <name>', 'watch a specific session only')
    .action((opts) => {
      const interval = parseInt(opts.interval, 10) || DEFAULT_INTERVAL;
      console.log(`Watching for session changes every ${interval}ms... (Ctrl+C to stop)\n`);

      let prev = readSessions();

      const timer = setInterval(() => {
        const curr = readSessions();
        let changes = diffSessionSets(prev, curr);

        if (opts.session) {
          changes = changes.filter(c => c.name === opts.session);
        }

        if (changes.length > 0) {
          console.log(`[${new Date().toLocaleTimeString()}] Changes detected:`);
          changes.forEach(c => console.log(formatChange(c.type, c.name)));
          console.log();
        }

        prev = curr;
      }, interval);

      process.on('SIGINT', () => {
        clearInterval(timer);
        console.log('\nStopped watching.');
        process.exit(0);
      });
    });
}

module.exports = { diffSessionSets, formatChange, registerWatchCommand };
