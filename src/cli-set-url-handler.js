const { getSession, saveSession } = require('./storage');

function setUrl(sessions, sessionName, index, newUrl) {
  const session = sessions[sessionName];
  if (!session) throw new Error(`Session "${sessionName}" not found`);

  const urls = session.urls;
  if (index < 0 || index >= urls.length) {
    throw new Error(`Index ${index} out of range (session has ${urls.length} URLs)`);
  }

  try {
    new URL(newUrl);
  } catch {
    throw new Error(`Invalid URL: ${newUrl}`);
  }

  const updated = { ...session, urls: [...urls] };
  updated.urls[index] = newUrl;
  return updated;
}

function registerSetUrlCommand(program, { readSessions, writeSessions } = require('./storage')) {
  program
    .command('set-url <session> <index> <url>')
    .description('replace a URL at a given index in a session')
    .action((sessionName, indexStr, newUrl) => {
      const index = parseInt(indexStr, 10);
      if (isNaN(index)) {
        console.error('Index must be a number');
        process.exit(1);
      }

      let sessions;
      try {
        sessions = readSessions();
      } catch (e) {
        console.error('Failed to read sessions:', e.message);
        process.exit(1);
      }

      let updated;
      try {
        updated = setUrl(sessions, sessionName, index, newUrl);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }

      sessions[sessionName] = updated;
      writeSessions(sessions);
      console.log(`Updated URL at index ${index} in "${sessionName}"`);
    });
}

module.exports = { setUrl, registerSetUrlCommand };
