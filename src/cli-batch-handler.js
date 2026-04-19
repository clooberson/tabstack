const { getSession, writeSessions, readSessions } = require('./storage');
const { restoreSession } = require('./restore');

async function batchRestore(names, options = {}) {
  const results = [];
  for (const name of names) {
    try {
      await restoreSession(name, options.browser);
      results.push({ name, status: 'ok' });
    } catch (err) {
      results.push({ name, status: 'error', message: err.message });
    }
  }
  return results;
}

async function batchDelete(names) {
  const sessions = await readSessions();
  const results = [];
  for (const name of names) {
    if (sessions[name]) {
      delete sessions[name];
      results.push({ name, status: 'ok' });
    } else {
      results.push({ name, status: 'error', message: 'Session not found' });
    }
  }
  await writeSessions(sessions);
  return results;
}

function registerBatchCommand(program) {
  const batch = program.command('batch').description('Run a command on multiple sessions');

  batch
    .command('restore <names...>')
    .description('Restore multiple sessions')
    .option('-b, --browser <browser>', 'browser to use')
    .action(async (names, opts) => {
      const results = await batchRestore(names, opts);
      for (const r of results) {
        if (r.status === 'ok') console.log(`✓ restored: ${r.name}`);
        else console.error(`✗ ${r.name}: ${r.message}`);
      }
    });

  batch
    .command('delete <names...>')
    .description('Delete multiple sessions')
    .action(async (names) => {
      const results = await batchDelete(names);
      for (const r of results) {
        if (r.status === 'ok') console.log(`✓ deleted: ${r.name}`);
        else console.error(`✗ ${r.name}: ${r.message}`);
      }
    });
}

module.exports = { batchRestore, batchDelete, registerBatchCommand };
