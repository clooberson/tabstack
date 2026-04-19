const { getSession, writeSessions, readSessions } = require('./storage');

function renameUrl(sessionName, oldUrl, newUrl) {
  const sessions = readSessions();
  const session = getSession(sessions, sessionName);

  if (!session) {
    throw new Error(`Session "${sessionName}" not found`);
  }

  const index = session.urls.indexOf(oldUrl);
  if (index === -1) {
    throw new Error(`URL "${oldUrl}" not found in session "${sessionName}"`);
  }

  session.urls[index] = newUrl;
  session.updatedAt = new Date().toISOString();
  writeSessions(sessions);
  return session;
}

function registerRenameUrlCommand(program) {
  program
    .command('rename-url <session> <oldUrl> <newUrl>')
    .description('replace a URL in a session with a new one')
    .action((session, oldUrl, newUrl) => {
      try {
        renameUrl(session, oldUrl, newUrl);
        console.log(`Replaced "${oldUrl}" with "${newUrl}" in session "${session}"`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
}

module.exports = { renameUrl, registerRenameUrlCommand };
