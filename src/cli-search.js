import { readSessions } from './storage.js';

export function registerSearchCommand(program) {
  program
    .command('search <query>')
    .description('search for tabs across all sessions')
    .option('-s, --session <name>', 'limit search to a specific session')
    .action(async (query, options) => {
      const sessions = await readSessions();
      const sessionNames = options.session
        ? [options.session]
        : Object.keys(sessions);

      if (options.session && !sessions[options.session]) {
        console.error(`Session "${options.session}" not found.`);
        process.exit(1);
      }

      const lowerQuery = query.toLowerCase();
      let totalMatches = 0;

      for (const name of sessionNames) {
        const session = sessions[name];
        if (!session || !session.urls) continue;

        const matches = session.urls.filter((url) =>
          url.toLowerCase().includes(lowerQuery)
        );

        if (matches.length > 0) {
          console.log(`\nSession: ${name}`);
          matches.forEach((url) => console.log(`  ${url}`));
          totalMatches += matches.length;
        }
      }

      if (totalMatches === 0) {
        console.log(`No tabs found matching "${query}".`);
      } else {
        console.log(`\nFound ${totalMatches} matching tab(s).`);
      }
    });
}
