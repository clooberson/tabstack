const { setAccessLevel, getAccessLevel, listByAccess } = require('./cli-access-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], accessLevel: 'private' },
    personal: { urls: ['https://reddit.com'] },
    shared: { urls: ['https://docs.google.com'], accessLevel: 'restricted' },
  };
}

describe('setAccessLevel', () => {
  test('sets a valid access level', () => {
    const sessions = makeSessions();
    const updated = setAccessLevel(sessions, 'personal', 'private');
    expect(updated.personal.accessLevel).toBe('private');
  });

  test('throws on invalid level', () => {
    const sessions = makeSessions();
    expect(() => setAccessLevel(sessions, 'work', 'secret')).toThrow('Invalid access level');
  });

  test('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => setAccessLevel(sessions, 'missing', 'public')).toThrow('not found');
  });
});

describe('getAccessLevel', () => {
  test('returns set access level', () => {
    const sessions = makeSessions();
    expect(getAccessLevel(sessions, 'work')).toBe('private');
  });

  test('defaults to public if not set', () => {
    const sessions = makeSessions();
    expect(getAccessLevel(sessions, 'personal')).toBe('public');
  });

  test('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => getAccessLevel(sessions, 'ghost')).toThrow('not found');
  });
});

describe('listByAccess', () => {
  test('lists sessions with given level', () => {
    const sessions = makeSessions();
    expect(listByAccess(sessions, 'private')).toEqual(['work']);
  });

  test('includes sessions defaulting to public', () => {
    const sessions = makeSessions();
    expect(listByAccess(sessions, 'public')).toEqual(['personal']);
  });

  test('returns empty array if none match', () => {
    const sessions = makeSessions();
    expect(listByAccess(sessions, 'restricted')).toEqual(['shared']);
  });

  test('throws on invalid level', () => {
    const sessions = makeSessions();
    expect(() => listByAccess(sessions, 'unknown')).toThrow('Invalid access level');
  });
});
