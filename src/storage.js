const fs = require('fs');
const path = require('path');
const os = require('os');

const STORAGE_DIR = path.join(os.homedir(), '.tabstack');
const SESSIONS_FILE = path.join(STORAGE_DIR, 'sessions.json');

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function readSessions() {
  ensureStorageDir();
  if (!fs.existsSync(SESSIONS_FILE)) return [];
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeSessions(sessions) {
  ensureStorageDir();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

function saveSession(name, urls) {
  const sessions = readSessions();
  const existing = sessions.findIndex((s) => s.name === name);
  const session = { name, urls, savedAt: new Date().toISOString() };
  if (existing >= 0) {
    sessions[existing] = session;
  } else {
    sessions.push(session);
  }
  writeSessions(sessions);
  return session;
}

function getSession(name) {
  const sessions = readSessions();
  return sessions.find((s) => s.name === name) || null;
}

function listSessions() {
  return readSessions();
}

function deleteSession(name) {
  const sessions = readSessions();
  const index = sessions.findIndex((s) => s.name === name);
  if (index === -1) return false;
  sessions.splice(index, 1);
  writeSessions(sessions);
  return true;
}

/**
 * Rename an existing session. Returns the updated session object,
 * or null if the original session wasn't found.
 * Throws if newName is already taken by another session.
 */
function renameSession(oldName, newName) {
  const sessions = readSessions();
  const index = sessions.findIndex((s) => s.name === oldName);
  if (index === -1) return null;
  const conflict = sessions.findIndex((s) => s.name === newName);
  if (conflict !== -1) throw new Error(`A session named "${newName}" already exists`);
  sessions[index] = { ...sessions[index], name: newName };
  writeSessions(sessions);
  return sessions[index];
}

module.exports = { ensureStorageDir, readSessions, writeSessions, saveSession, getSession, listSessions, deleteSession, renameSession };
