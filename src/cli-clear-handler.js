const { readSessions, writeSessions } = require('./storage');

async function clearAllSessions(options = {}) {
  const sessions = await readSessions();
  const keys = Object.keys(sessions);

  if (keys.length === 0) {
    return { cleared: 0, message: 'No sessions to clear.' };
  }

  if (options.filter === 'archived') {
    const toDelete = keys.filter(k => sessions[k].archived);
    toDelete.forEach(k => delete sessions[k]);
    await writeSessions(sessions);
    return { cleared: toDelete.length, message: `Cleared ${toDelete.length} archived session(s).` };
  }

  if (options.filter === 'favorites') {
    const toDelete = keys.filter(k => sessions[k].favorite);
    toDelete.forEach(k => delete sessions[k]);
    await writeSessions(sessions);
    return { cleared: toDelete.length, message: `Cleared ${toDelete.length} favorite session(s).` };
  }

  await writeSessions({});
  return { cleared: keys.length, message: `Cleared all ${keys.length} session(s).` };
}

function registerClearCommand(program) {
  program
    .command('clear')
    .description('Delete all saved sessions')
    .option('--archived', 'Only clear archived sessions')
    .option('--favorites', 'Only clear favorite sessions')
    .option('-y, --yes', 'Skip confirmation prompt')
    .action(async (opts) => {
      const filter = opts.archived ? 'archived' : opts.favorites ? 'favorites' : null;

      if (!opts.yes) {
        const target = filter ? `all ${filter} sessions` : 'ALL sessions';
        console.log(`This will delete ${target}. Use --yes to confirm.`);
        process.exit(0);
      }

      try {
        const result = await clearAllSessions({ filter });
        console.log(result.message);
      } catch (err) {
        console.error('Error clearing sessions:', err.message);
        process.exit(1);
      }
    });
}

module.exports = { clearAllSessions, registerClearCommand };
