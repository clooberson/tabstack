const { readSessions } = require('./storage');

function countSessions(sessions) {
  const names = Object.keys(sessions);
  const total = names.length;
  const totalUrls = names.reduce((sum, name) => sum + (sessions[name].urls || []).length, 0);
  const tagged = names.filter(name => sessions[name].tags && sessions[name].tags.length > 0).length;
  const pinned = names.filter(name => sessions[name].pinned).length;
  const archived = names.filter(name => sessions[name].archived).length;
  const favorites = names.filter(name => sessions[name].favorite).length;

  return { total, totalUrls, tagged, pinned, archived, favorites };
}

function registerCountCommand(program) {
  program
    .command('count')
    .description('show counts of sessions and their properties')
    .option('--json', 'output as JSON')
    .action(async (options) => {
      const sessions = await readSessions();
      const counts = countSessions(sessions);

      if (options.json) {
        console.log(JSON.stringify(counts, null, 2));
        return;
      }

      console.log(`Total sessions:  ${counts.total}`);
      console.log(`Total URLs:      ${counts.totalUrls}`);
      console.log(`Tagged:          ${counts.tagged}`);
      console.log(`Pinned:          ${counts.pinned}`);
      console.log(`Archived:        ${counts.archived}`);
      console.log(`Favorites:       ${counts.favorites}`);
    });
}

module.exports = { countSessions, registerCountCommand };
