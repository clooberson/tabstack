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
  if (!fs.existsSync(SESSIONS_FILE)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeSessions(sessions) {
  ensureStorageDir();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
}

function saveSession(name, urls) {
  const sessions = readSessions();
  sessions[name] = {
    urls,
    savedAt: new Date().toISOString()
  };
  writeSessions(sessions);
}

function getSession(name) {
  const sessions = readSessions();
  return sessions[name] || null;
}

function deleteSession(name) {
  const sessions = readSessions();
  if (!sessions[name]) return false;
  delete sessions[name];
  writeSessions(sessions);
  return true;
}

function listSessions() {
  return readSessions();
}

module.exports = { saveSession, getSession, deleteSession, listSessions };
