const { getSession, writeSessions, readSessions } = require('./storage');

function scheduleRestore(sessionName, time, browser) {
  const sessions = readSessions();
  if (!sessions[sessionName]) {
    throw new Error(`Session "${sessionName}" not found`);
  }

  const scheduled = sessions[sessionName].scheduled || [];
  scheduled.push({ time, browser: browser || null, createdAt: new Date().toISOString() });
  sessions[sessionName].scheduled = scheduled;
  writeSessions(sessions);
  return { sessionName, time, browser };
}

function listScheduled() {
  const sessions = readSessions();
  const results = [];
  for (const [, session] of Object.entries(sessions)) {
    if (session.scheduled && session.scheduled.length > 0) {
      for (const entry of session.scheduled) {
        results.push({Name: name, ...entry });
      }
    }
  }
  return results;
}

function clearScheduled(sessionName) {
  const sessions = readSessions();
  ifn    throw new Error(`Session "${sessionName}" not found`);
  }
  sessions[sessionName].scheduled = [];
  writeSessions(sessions);
}

function registerScheduleCommand(program) {
  const scheduledescription('Schedule session restores');

  schedule
    .command('add <session> <time>')
    .description('Schedule time (e.g. 09:00)')
    .option('-b, --browser <browser>', 'browser to use')
    .action((session, time, opts) => {
      try {
        const result = scheduleRestore(session, time, opts.browser);
        console.log(`Scheduled "${result.sessionName}" for restore at ${result.time}`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  schedule
    .command('list')
    .description('List all scheduled restores')
    .action(() => {
      const entries = listScheduled();
      if (entries.length === 0) {
        console.log('No scheduled restores.');
        return;
      }
      for (const e of entries) {
        const browser = e.browser ? ` [${e.browser}]` : '';
        console.log(`${e.sessionName} @ ${e.time}${browser}`);
      }
    });

  schedule
    .command('clear <session>')
    .description('Clear all scheduled restores for a session')
    .action((session) => {
      try {
        clearScheduled(session);
        console.log(`Cleared scheduled restores for "${session}"`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
}

module.exports = { scheduleRestore, listScheduled, clearScheduled, registerScheduleCommand };
