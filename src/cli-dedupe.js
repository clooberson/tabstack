import { Command } from 'commander';
import { getSession, saveSession } from './storage.js';

export function registerDedupeCommand(program) {
  program
    .command('dedupe <name>')
    .description('remove duplicate URLs from a saved session')
    .option('--dry-run', 'show duplicates without removing them')
    .action(async (name, options) => {
      const session = await getSession(name);
      if (!session) {
        console.error(`Session "${name}" not found.`);
        process.exit(1);
      }

      const seen = new Set();
      const duplicates = [];
      const unique = [];

      for (const url of session.urls) {
        if (seen.has(url)) {
          duplicates.push(url);
        } else {
          seen.add(url);
          unique.push(url);
        }
      }

      if (duplicates.length === 0) {
        console.log(`No duplicates found in "${name}".`);
        return;
      }

      console.log(`Found ${duplicates.length} duplicate(s):`);
      duplicates.forEach(url => console.log(`  - ${url}`));

      if (options.dryRun) {
        console.log('Dry run — no changes made.');
        return;
      }

      await saveSession(name, { ...session, urls: unique });
      console.log(`Removed ${duplicates.length} duplicate(s) from "${name}".`);
    });
}
