import { readSessions, writeSessions } from './storage.js';

export function registerTrimCommand(program) {
  program
    .command('trim <name>')
    .description('remove duplicate or excess URLs from a session, keeping only the first N tabs')
    .option('-n, --max <number>', 'maximum number of tabs to keep', parseInt)
    .option('--dry-run', 'show what would be removed without modifying')
    .action(async (name, options) => {
      const sessions = await readSessions();
      const session = sessions[name];

      if (!session) {
        console.error(`Session "${name}" not found.`);
        process.exit(1);
      }

      const original = session.urls;
      const max = options.max;
      let trimmed = [...original];

      if (max && max > 0) {
        trimmed = trimmed.slice(0, max);
      }

      const removed = original.length - trimmed.length;

      if (options.dryRun) {
        console.log(`Would remove ${removed} tab(s) from "${name}" (${original.length} -> ${trimmed.length}).`);
        if (removed > 0) {
          console.log('Tabs that would be removed:');
          original.slice(trimmed.length).forEach(url => console.log(`  - ${url}`));
        }
        return;
      }

      if (removed === 0) {
        console.log(`No tabs removed from "${name}".`);
        return;
      }

      sessions[name] = { ...session, urls: trimmed };
      await writeSessions(sessions);
      console.log(`Trimmed "${name}": removed ${removed} tab(s) (${original.length} -> ${trimmed.length}).`);
    });
}
