import { readSessions, writeSessions } from './storage.js';

export function registerSortCommand(program) {
  program
    .command('sort')
    .description('sort tabs within a session by url or title')
    .argument('<name>', 'session name')
    .option('-b, --by <field>', 'sort by field: url or title', 'url')
    .option('-r, --reverse', 'sort in reverse order', false)
    .action(async (name, options) => {
      const sessions = await readSessions();

      if (!sessions[name]) {
        console.error(`session "${name}" not found`);
        process.exit(1);
      }

      const validFields = ['url', 'title'];
      if (!validFields.includes(options.by)) {
        console.error(`invalid sort field "${options.by}", use: url or title`);
        process.exit(1);
      }

      const tabs = [...sessions[name].urls];

      tabs.sort((a, b) => {
        const av = (a[options.by] || a).toLowerCase();
        const bv = (b[options.by] || b).toLowerCase();
        return av < bv ? -1 : av > bv ? 1 : 0;
      });

      if (options.reverse) tabs.reverse();

      sessions[name].urls = tabs;
      await writeSessions(sessions);

      console.log(`sorted ${tabs.length} tabs in "${name}" by ${options.by}${options.reverse ? ' (reversed)' : ''}`);
    });
}
