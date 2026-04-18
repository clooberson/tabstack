import { readSessions } from './storage.js';

function getStats(sessions) {
  const names = Object.keys(sessions);
  const totalSessions = names.length;
  const urlCounts = names.map(name => (sessions[name].urls || []).length);
  const totalUrls = urlCounts.reduce((a, b) => a + b, 0);
  const avgUrls = totalSessions > 0 ? (totalUrls / totalSessions).toFixed(1) : 0;
  const largest = names.reduce((best, name) => {
    const count = (sessions[name].urls || []).length;
    return count > (best.count || 0) ? { name, count } : best;
  }, {});
  const tags = new Set();
  names.forEach(name => {
    (sessions[name].tags || []).forEach(t => tags.add(t));
  });
  return { totalSessions, totalUrls, avgUrls, largest, uniqueTags: tags.size };
}

export function registerStatsCommand(program) {
  program
    .command('stats')
    .description('show statistics about saved sessions')
    .action(() => {
      const sessions = readSessions();
      const stats = getStats(sessions);

      if (stats.totalSessions === 0) {
        console.log('No sessions saved yet.');
        return;
      }

      console.log(`Sessions:     ${stats.totalSessions}`);
      console.log(`Total URLs:   ${stats.totalUrls}`);
      console.log(`Avg URLs:     ${stats.avgUrls}`);
      console.log(`Unique tags:  ${stats.uniqueTags}`);
      if (stats.largest.name) {
        console.log(`Largest:      ${stats.largest.name} (${stats.largest.count} URLs)`);
      }
    });
}
