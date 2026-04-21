const { readSessions } = require('./storage');

function getStatus(sessions) {
  const names = Object.keys(sessions);
  const total = names.length;
  const locked = names.filter(n => sessions[n].locked).length;
  const archived = names.filter(n => sessions[n].archived).length;
  const favorites = names.filter(n => sessions[n].favorite).length;
  const withTags = names.filter(n => sessions[n].tags && sessions[n].tags.length > 0).length;
  const withNotes = names.filter(n => sessions[n].note && sessions[n].note.trim()).length;
  const totalUrls = names.reduce((sum, n) => sum + (sessions[n].urls || []).length, 0);
  const avgUrls = total > 0 ? (totalUrls / total).toFixed(1) : '0.0';

  return {
    total,
    locked,
    archived,
    favorites,
    withTags,
    withNotes,
    totalUrls,
    avgUrls,
  };
}

function formatStatus(status) {
  const lines = [
    `Sessions:   ${status.total}`,
    `URLs:       ${status.totalUrls} total, ${status.avgUrls} avg per session`,
    `Locked:     ${status.locked}`,
    `Archived:   ${status.archived}`,
    `Favorites:  ${status.favorites}`,
    `Tagged:     ${status.withTags}`,
    `With notes: ${status.withNotes}`,
  ];
  return lines.join('\n');
}

function registerStatusCommand(program) {
  program
    .command('status')
    .description('show overall status and summary of all saved sessions')
    .action(() => {
      const sessions = readSessions();
      const status = getStatus(sessions);
      console.log(formatStatus(status));
    });
}

module.exports = { getStatus, formatStatus, registerStatusCommand };
