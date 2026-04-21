const { setAccessLevel, getAccessLevel, listByAccess } = require('./cli-access-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], access: 'private' },
    personal: { urls: ['https://reddit.com'] },
    shared: { urls: ['https://docs.google.com'], access: 'restricted' },
  };
}

describe('setAccessLevel', () => {
  it('sets a valid access level', () => {
    const sessions = makeSessions();
    setAccessLevel(sessions, 'personal', 'private');
    expect(sessions.personal.access).toBe('private');
  });

  it('throws for unknown session', () => {
    const sessions = makeSessions();
    expect(() => setAccessLevel(sessions, 'ghost', 'public')).toThrow('not found');
  });

  it('throws for invalid level', () => {
    const sessions = makeSessions();
    expect(() => setAccessLevel(sessions, 'work', 'admin')).toThrow('Invalid access level');
  });

  it('overwrites existing access level', () => {
    const sessions = makeSessions();
    setAccessLevel(sessions, 'work', 'public');
    expect(sessions.work.access).toBe('public');
  });
});

describe('getAccessLevel', () => {
  it('returns the access level if set', () => {
    const sessions = makeSessions();
    expect(getAccessLevel(sessions, 'work')).toBe('private');
  });

  it('defaults to public if not set', () => {
    const sessions = makeSessions();
    expect(getAccessLevel(sessions, 'personal')).toBe('public');
  });

  it('throws for unknown session', () => {
    const sessions = makeSessions();
    expect(() => getAccessLevel(sessions, 'nope')).toThrow('not found');
  });
});

describe('listByAccess', () => {
  it('lists sessions with matching access level', () => {
    const sessions = makeSessions();
    expect(listByAccess(sessions, 'private')).toEqual(['work']);
  });

  it('defaults unset sessions to public', () => {
    const sessions = makeSessions();
    expect(listByAccess(sessions, 'public')).toEqual(['personal']);
  });

  it('returns empty array when no matches', () => {
    const sessions = makeSessions();
    expect(listByAccess(sessions, 'restricted')).toEqual(['shared']);
  });

  it('throws for invalid level', () => {
    const sessions = makeSessions();
    expect(() => listByAccess(sessions, 'superuser')).toThrow('Invalid access level');
  });
});
