const { readSessions, writeSessions } = require('./storage');

function toggleFavorite(name, value) {
  const sessions = readSessions();
  if (!sessions[name]) {
    throw new Error(`Session "${name}" not found`);
  }
  sessions[name].favorite = value !== undefined ? value : !sessions[name].favorite;
  writeSessions(sessions);
  return sessions[name].favorite;
}

function listFavorites() {
  const sessions = readSessions();
  return Object.entries(sessions)
    .filter(([, s]) => s.favorite)
    .map(([name, s]) => ({ name, ...s }));
}

function registerFavoriteCommand(program) {
  const cmd = program.command('favorite').description('manage favorite sessions');

  cmd
    .command('add <name>')
    .description('mark a session as favorite')
    .action((name) => {
      try {
        toggleFavorite(name, true);
        console.log(`Marked "${name}" as favorite`);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  cmd
    .command('remove <name>')
    .description('unmark a session as favorite')
    .action((name) => {
      try {
        toggleFavorite(name, false);
        console.log(`Removed "${name}" from favorites`);
      } catch (e) {
        console.error(e.message);
        process.exit(1);
      }
    });

  cmd
    .command('list')
    .description('list all favorite sessions')
    .action(() => {
      const favs = listFavorites();
      if (favs.length === 0) {
        console.log('No favorite sessions');
      } else {
        favs.forEach((s) => console.log(`${s.name} (${s.urls.length} tabs)`));
      }
    });
}

module.exports = { toggleFavorite, listFavorites, registerFavoriteCommand };
