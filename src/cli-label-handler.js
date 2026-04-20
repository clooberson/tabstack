const { getSession, writeSessions, readSessions } = require('./storage');

function setLabel(sessions, name, label) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.label = label;
  return sessions;
}

function removeLabel(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.label;
  return sessions;
}

function getLabel(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.label || null;
}

function listByLabel(sessions, label) {
  return Object.entries(sessions)
    .filter(([, s]) => s.label === label)
    .map(([name, s]) => ({ name, ...s }));
}

function registerLabelCommand(program) {
  const label = program
    .command('label')
    .description('manage display labels for sessions');

  label
    .command('set <session> <label>')
    .description('set a display label for a session')
    .action(async (name, labelValue) => {
      try {
        const sessions = await readSessions();
        const updated = setLabel(sessions, name, labelValue);
        await writeSessions(updated);
        console.log(`Label "${labelValue}" set for session "${name}"`);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  label
    .command('remove <session>')
    .description('remove the label from a session')
    .action(async (name) => {
      try {
        const sessions = await readSessions();
        const updated = removeLabel(sessions, name);
        await writeSessions(updated);
        console.log(`Label removed from session "${name}"`);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  label
    .command('get <session>')
    .description('get the label for a session')
    .action(async (name) => {
      try {
        const sessions = await readSessions();
        const lbl = getLabel(sessions, name);
        if (lbl) console.log(lbl);
        else console.log(`No label set for "${name}"`);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  label
    .command('list <label>')
    .description('list all sessions with a given label')
    .action(async (labelValue) => {
      try {
        const sessions = await readSessions();
        const results = listByLabel(sessions, labelValue);
        if (results.length === 0) {
          console.log(`No sessions with label "${labelValue}"`);
        } else {
          results.forEach(s => console.log(`  ${s.name} (${s.urls ? s.urls.length : 0} urls)`));
        }
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });
}

module.exports = { setLabel, removeLabel, getLabel, listByLabel, registerLabelCommand };
