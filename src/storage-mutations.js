const { readSessions, writeSessions } = require('./storage');

function deleteSession(name) {
  const sessions = readSessions();
  if (!Object.prototype.hasOwnProperty.call(sessions, name)) {
    throw new Error(`Session "${name}" does not exist.`);
  }
  delete sessions[name];
  writeSessions(sessions);
}

function renameSession(oldName, newName) {
  const sessions = readSessions();
  if (!Object.prototype.hasOwnProperty.call(sessions, oldName)) {
    throw new Error(`Session "${oldName}" does not exist.`);
  }
  if (Object.prototype.hasOwnProperty.call(sessions, newName)) {
    throw new Error(`Session "${newName}" already exists.`);
  }
  sessions[newName] = { ...sessions[oldName], name: newName };
  delete sessions[oldName];
  writeSessions(sessions);
}

function listSessions() {
  const sessions = readSessions();
  return Object.keys(sessions);
}

module.exports = { deleteSession, renameSession, listSessions };
