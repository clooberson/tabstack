const { readSessions, writeSessions } = require('./storage');

function setNote(sessionName, note) {
  const sessions = readSessions();
  if (!sessions[sessionName]) {
    throw new Error(`Session "${sessionName}" not found`);
  }
  sessions[sessionName].note = note;
  writeSessions(sessions);
  return sessions[sessionName];
}

function getNote(sessionName) {
  const sessions = readSessions();
  if (!sessions[sessionName]) {
    throw new Error(`Session "${sessionName}" not found`);
  }
  return sessions[sessionName].note || null;
}

function clearNote(sessionName) {
  const sessions = readSessions();
  if (!sessions[sessionName]) {
    throw new Error(`Session "${sessionName}" not found`);
  }
  delete sessions[sessionName].note;
  writeSessions(sessions);
}

function registerNotesCommand(program) {
  const notes = program.command('notes').description('manage session notes');

  notes
    .command('set <session> <note>')
    .description('set a note for a session')
    .action((session, note) => {
      try {
        setNote(session, note);
        console.log(`Note set for "${session}"`);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  notes
    .command('get <session>')
    .description('get the note for a session')
    .action((session) => {
      try {
        const note = getNote(session);
        if (note) {
          console.log(note);
        } else {
          console.log(`No note for "${session}"`);
        }
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  notes
    .command('clear <session>')
    .description('clear the note for a session')
    .action((session) => {
      try {
        clearNote(session);
        console.log(`Note cleared for "${session}"`);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });
}

module.exports = { setNote, getNote, clearNote, registerNotesCommand };
