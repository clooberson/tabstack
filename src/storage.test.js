const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Point storage to a temp dir for tests
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabstack-test-'));
process.env.HOME = tmpDir;

const { saveSession, getSession, deleteSession, listSessions } = require('./storage');

describe('storage', () => {
  it('saves and retrieves a session', () => {
    saveSession('work', ['https://github.com', 'https://notion.so']);
    const session = getSession('work');
    assert.ok(session);
    assert.deepEqual(session.urls, ['https://github.com', 'https://notion.so']);
    assert.ok(session.savedAt);
  });

  it('returns null for unknown session', () => {
    const session = getSession('nonexistent');
    assert.equal(session, null);
  });

  it('lists all sessions', () => {
    saveSession('personal', ['https://twitter.com']);
    const sessions = listSessions();
    assert.ok(sessions['work']);
    assert.ok(sessions['personal']);
  });

  it('deletes a session', () => {
    const result = deleteSession('personal');
    assert.equal(result, true);
    assert.equal(getSession('personal'), null);
  });

  it('returns false when deleting nonexistent session', () => {
    const result = deleteSession('ghost');
    assert.equal(result, false);
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});
