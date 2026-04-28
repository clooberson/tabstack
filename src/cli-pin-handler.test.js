const { pinSession, unpinSession, listPinned } = require('./cli-pin-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com', 'https://jira.com'], pinned: false },
    personal: { urls: ['https://reddit.com'], pinned: true },
    research: { urls: ['https://arxiv.org', 'https://scholar.google.com'], pinned: false },
  };
}

describe('pinSession', () => {
  it('sets pinned to true on a session', () => {
    const sessions = makeSessions();
    const result = pinSession(sessions, 'work');
    expect(result.work.pinned).toBe(true);
  });

  it('throws if session does not exist', () => {
    const sessions = makeSessions();
    expect(() => pinSession(sessions, 'missing')).toThrow('Session "missing" not found');
  });

  it('does not affect other sessions', () => {
    const sessions = makeSessions();
    pinSession(sessions, 'work');
    expect(sessions.research.pinned).toBe(false);
  });
});

describe('unpinSession', () => {
  it('sets pinned to false on a session', () => {
    const sessions = makeSessions();
    const result = unpinSession(sessions, 'personal');
    expect(result.personal.pinned).toBe(false);
  });

  it('throws if session does not exist', () => {
    const sessions = makeSessions();
    expect(() => unpinSession(sessions, 'nope')).toThrow('Session "nope" not found');
  });
});

describe('listPinned', () => {
  it('returns only pinned sessions', () => {
    const sessions = makeSessions();
    const pinned = listPinned(sessions);
    expect(pinned).toHaveLength(1);
    expect(pinned[0].name).toBe('personal');
  });

  it('returns empty array when no sessions are pinned', () => {
    const sessions = makeSessions();
    sessions.personal.pinned = false;
    expect(listPinned(sessions)).toHaveLength(0);
  });

  it('returns name and urls for each pinned session', () => {
    const sessions = makeSessions();
    const pinned = listPinned(sessions);
    expect(pinned[0]).toMatchObject({ name: 'personal', urls: ['https://reddit.com'] });
  });
});
