import { getSession, saveSession } from './storage.js';

export async function dedupeSession(name, { dryRun = false } = {}) {
  const session = await getSession(name);
  if (!session) {
    return { error: `Session "${name}" not found.` };
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
    return { duplicates: [], removed: 0, changed: false };
  }

  if (!dryRun) {
    await saveSession(name, { ...session, urls: unique });
  }

  return {
    duplicates,
    removed: duplicates.length,
    changed: !dryRun,
  };
}
