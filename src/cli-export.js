import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { getSession, listSessions } from './storage.js';

export function registerExportCommand(program) {
  program
    .command('export [name]')
    .description('export a session or all sessions to a JSON file')
    .option('-o, --output <file>', 'output file path', 'tabstack-export.json')
    .option('-a, --all', 'export all sessions')
    .action((name, options) => {
      try {
        let data;

        if (options.all) {
          const sessions = listSessions();
          if (sessions.length === 0) {
            console.log('No sessions found.');
            process.exit(0);
          }
          data = sessions.reduce((acc, s) => {
            acc[s.name] = getSession(s.name);
            return acc;
          }, {});
          console.log(`Exporting ${sessions.length} session(s)...`);
        } else {
          if (!name) {
            console.error('Error: provide a session name or use --all');
            process.exit(1);
          }
          const session = getSession(name);
          if (!session) {
            console.error(`Error: session "${name}" not found`);
            process.exit(1);
          }
          data = { [name]: session };
        }

        const outPath = path.resolve(options.output);
        fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
        console.log(`Exported to ${outPath}`);
      } catch (err) {
        console.error('Export failed:', err.message);
        process.exit(1);
      }
    });
}
