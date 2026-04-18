import { readFileSync } from 'fs';
import { saveSession } from './storage.js';

export function registerImportCommand(program) {
  program
    .command('import <file>')
    .description('import sessions from a JSON file')
    .option('--overwrite', 'overwrite existing sessions with the same name')
    .action((file, options) => {
      let data;
      try {
        const raw = readFileSync(file, 'utf-8');
        data = JSON.parse(raw);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.error(`File not found: ${file}`);
        } else {
          console.error(`Failed to parse file: ${err.message}`);
        }
        process.exit(1);
      }

      if (!Array.isArray(data)) {
        console.error('Invalid format: expected an array of sessions');
        process.exit(1);
      }

      let imported = 0;
      let skipped = 0;

      for (const session of data) {
        if (!session.name || !Array.isArray(session.urls)) {
          console.warn(`Skipping invalid session entry: ${JSON.stringify(session)}`);
          skipped++;
          continue;
        }

        try {
          saveSession(session.name, session.urls, { overwrite: options.overwrite });
          console.log(`Imported: ${session.name} (${session.urls.length} tabs)`);
          imported++;
        } catch (err) {
          console.warn(`Skipped "${session.name}": ${err.message}`);
          skipped++;
        }
      }

      console.log(`\nDone. ${imported} imported, ${skipped} skipped.`);
    });
}
