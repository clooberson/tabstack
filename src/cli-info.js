import { getSession } from './storage.js';

export function registerInfoCommand(program) {
  program
    .command('info <name>')
    .description('show details about a saved session')
    .action((name) => {
      const session = getSession(name);

      if (!session) {
        console.error(`Session "${name}" not found.`);
        process.exit(1);
      }

      const { urls, createdAt, updatedAt } = session;
      const created = new Date(createdAt).toLocaleString();
      const updated = updatedAt ? new Date(updatedAt).toLocaleString() : null;

      console.log(`Session: ${name}`);
      console.log(`Tabs:    ${urls.length}`);
      console.log(`Created: ${created}`);
      if (updated) {
        console.log(`Updated: ${updated}`);
      }
      console.log('URLs:');
      urls.forEach((url, i) => {
        console.log(`  ${i + 1}. ${url}`);
      });
    });
}
