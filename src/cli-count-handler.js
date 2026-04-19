const { readSessions } = require('./storage');

function countSessions(sessions) {
  const names = Object.keys(sessions);
  const total = names.length;
  const totalUrls = names.reduce((sum, name) => sum + (sessions[name].urls || []).length, 0);
  const archived = names.filter(n => sessions[n].archived).length;
  const favorites = names.filter(n => sessions[n].favorite).length;
  const tagged = names.filter(n => sessions[n].tags && sessions[n].tags.length > 0).length;
  return { total, totalUrls, archived, favorites, tagged };
}

function registerCountCommand(program) {
  program
    .command('count')
    .description('show count of saved sessions and urls')
    .option('--json', 'output as json')
    .action(async (options) => {
      try {
        const sessions = await readSessions();
        const counts = countSessions(sessions);
        if (options.json) {
          console.log(JSON.stringify(counts, null, 2));
        } else {
          console.log(`Sessions:   ${counts.total}`);
          console.log(`URLs:       ${counts.totalUrls}`);
          console.log(`Archived:   ${counts.archived}`);
          console.log(`Favorites:  ${counts.favorites}`);
          console.log(`Tagged:     ${counts.tagged}`);
        }
      } catch (err) {
        console.error('Error counting sessions:', err.message);
        process.exit(1);
      }
    });
}

module.exports = { countSessions, registerCountCommand };
