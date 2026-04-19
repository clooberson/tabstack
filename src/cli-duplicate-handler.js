const { getSession, saveSession } = require('./storage');

function duplicateSession(sessions, sourceName, newName) {
  const source = getSession(sessions, sourceName);
  if (!source) {
    throw new Error(`Session "${sourceName}" not found`);
  }
  const existing = getSession(sessions, newName);
  if (existing) {
    throw new Error(`Session "${newName}" already exists`);
  }
  const duplicate = {
    ...source,
    name: newName,
    createdAt: new Date().toISOString(),
    tags: source.tags ? [...source.tags] : [],
    urls: [...source.urls],
  };
  delete duplicate.favorite;
  delete duplicate.note;
  return saveSession(sessions, duplicate);
}

function registerDuplicateCommand(program, { readSessions, writeSessions }) {
  program
    .command('duplicate <source> <new-name>')
    .description('duplicate an existing session under a new name')
    .action((source, newName) => {
      try {
        const sessions = readSessions();
        const updated = duplicateSession(sessions, source, newName);
        writeSessions(updated);
        console.log(`Session "${source}" duplicated as "${newName}"`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
}

module.exports = { duplicateSession, registerDuplicateCommand };
