import { getSession, saveSession } from './storage.js';
import { listSessions } from './storage-mutations.js';

export function mergeSessionsIntoNew(sessionNames, newName, sessions) {
  const merged = { name: newName, urls: [], createdAt: new Date().toISOString(), tags: [] };
  const seen = new Set();

  for (const name of sessionNames) {
    const session = sessions[name];
    if (!session) throw new Error(`Session not found: ${name}`);
    for (const url of session.urls) {
      if (!seen.has(url)) {
        seen.add(url);
        merged.urls.push(url);
      }
    }
    if (session.tags) {
      for (const tag of session.tags) {
        if (!merged.tags.includes(tag)) merged.tags.push(tag);
      }
    }
  }

  return merged;
}

export function registerMergeCommand(program, { readSessions, saveSession } = {}) {
  const _readSessions = readSessions || (await import('./storage.js')).readSessions;
  const _saveSession = saveSession || (await import('./storage.js')).saveSession;

  program
    .command('merge <sessions...>')
    .description('merge multiple sessions into a new one')
    .requiredOption('-n, --name <name>', 'name for the merged session')
    .option('--no-dedup', 'keep duplicate urls')
    .action(async (sessionNames, opts) => {
      try {
        const sessions = await _readSessions();
        const existing = Object.keys(sessions);
        for (const s of sessionNames) {
          if (!existing.includes(s)) {
            console.error(`Session not found: ${s}`);
            process.exit(1);
          }
        }
        if (sessions[opts.name]) {
          console.error(`Session already exists: ${opts.name}`);
          process.exit(1);
        }
        const merged = mergeSessionsIntoNew(sessionNames, opts.name, sessions);
        await _saveSession(merged);
        console.log(`Merged ${sessionNames.join(', ')} into "${opts.name}" (${merged.urls.length} urls)`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
