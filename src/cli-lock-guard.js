const { readSessions } = require('./storage');

/**
 * Throws if the named session is locked.
 * Use this in mutation commands (delete, rename, etc.) before applying changes.
 */
function guardLocked(name) {
  const sessions = readSessions();
  const session = sessions[name];
  if (!session) return; // let the caller handle missing session
  if (session.locked) {
    throw new Error(`Session "${name}" is locked. Run \`tabstack unlock ${name}\` first.`);
  }
}

module.exports = { guardLocked };
