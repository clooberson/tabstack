import { saveSession, readSessions } from './storage.js';

export function createSnapshotName(baseName) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}-snapshot-${timestamp}`;
}

export function registerSnapshotCommand(program) {
  program
    .command('snapshot <session>')
    .description('create a timestamped snapshot copy of a session')
    .option('-n, --name <name>', 'custom snapshot name')
    .action(async (session, options) => {
      const sessions = await readSessions();
      if (!sessions[session]) {
        console.error(`Session "${session}" not found.`);
        process.exit(1);
      }

      const snapshotName = options.name || createSnapshotName(session);

      if (sessions[snapshotName]) {
        console.error(`Snapshot "${snapshotName}" already exists.`);
        process.exit(1);
      }

      const original = sessions[session];
      const snapshot = {
        ...original,
        urls: [...original.urls],
        tags: original.tags ? [...original.tags] : [],
        snapshotOf: session,
        createdAt: new Date().toISOString(),
      };

      await saveSession(snapshotName, snapshot);
      console.log(`Snapshot "${snapshotName}" created from "${session}" (${snapshot.urls.length} tabs).`);
    });
}
