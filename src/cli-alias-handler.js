const { readSessions, writeSessions } = require('./storage');

function setAlias(sessionName, alias) {
  const sessions = readSessions();

  if (!sessions[sessionName]) {
    throw new Error(`Session "${sessionName}" not found`);
  }

  // Check alias isn't already taken by another session
  const conflict = Object.entries(sessions).find(
    ([name, s]) => s.alias === alias && name !== sessionName
  );
  if (conflict) {
    throw new Error(`Alias "${alias}" is already used by session "${conflict[0]}"`);
  }

  sessions[sessionName].alias = alias;
  writeSessions(sessions);
  return alias;
}

function removeAlias(sessionName) {
  const sessions = readSessions();

  if (!sessions[sessionName]) {
    throw new Error(`Session "${sessionName}" not found`);
  }

  if (!sessions[sessionName].alias) {
    throw new Error(`Session "${sessionName}" has no alias set`);
  }

  delete sessions[sessionName].alias;
  writeSessions(sessions);
}

function resolveAlias(nameOrAlias) {
  const sessions = readSessions();

  if (sessions[nameOrAlias]) return nameOrAlias;

  const match = Object.entries(sessions).find(
    ([, s]) => s.alias === nameOrAlias
  );
  return match ? match[0] : null;
}

function listAliases() {
  const sessions = readSessions();
  return Object.entries(sessions)
    .filter(([, s]) => s.alias)
    .map(([name, s]) => ({ name, alias: s.alias }));
}

function registerAliasCommand(program) {
  const alias = program
    .command('alias')
    .description('manage session aliases');

  alias
    .command('set <session> <alias>')
    .description('set an alias for a session')
    .action((session, aliasName) => {
      try {
        setAlias(session, aliasName);
        console.log(`Alias "${aliasName}" set for session "${session}"`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  alias
    .command('remove <session>')
    .description('remove alias from a session')
    .action((session) => {
      try {
        removeAlias(session);
        console.log(`Alias removed from session "${session}"`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  alias
    .command('list')
    .description('list all aliases')
    .action(() => {
      const aliases = listAliases();
      if (aliases.length === 0) {
        console.log('No aliases defined.');
        return;
      }
      aliases.forEach(({ name, alias: a }) => {
        console.log(`${a} -> ${name}`);
      });
    });
}

module.exports = { setAlias, removeAlias, resolveAlias, listAliases, registerAliasCommand };
