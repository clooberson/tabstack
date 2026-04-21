const { setVisibility, getVisibility, listByVisibility } = require('./cli-visibility-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], visibility: 'private' },
    personal: { urls: ['https://reddit.com'], visibility: 'public' },
    secret: { urls: ['https://example.com'], visibility: 'hidden' },
    novis: { urls: ['https://nodejs.org'] },
  };
}

describe('setVisibility', () => {
  test('sets visibility on existing session', () => {
    const sessions = makeSessions();
    const updated = setVisibility(sessions, 'work', 'public');
    expect(updated.work.visibility).toBe('public');
  });

  test('throws on unknown session', () => {
    const sessions = makeSessions();
    expect(() => setVisibility(sessions, 'ghost', 'public')).toThrow('not found');
  });

  test('throws on invalid visibility value', () => {
    const sessions = makeSessions();
    expect(() => setVisibility(sessions, 'work', 'secret-level')).toThrow('Invalid visibility');
  });
});

describe('getVisibility', () => {
  test('returns set visibility', () => {
    const sessions = makeSessions();
    expect(getVisibility(sessions, 'work')).toBe('private');
  });

  test('defaults to public when not set', () => {
    const sessions = makeSessions();
    expect(getVisibility(sessions, 'novis')).toBe('public');
  });

  test('throws on unknown session', () => {
    const sessions = makeSessions();
    expect(() => getVisibility(sessions, 'nope')).toThrow('not found');
  });
});

describe('listByVisibility', () => {
  test('lists sessions matching visibility', () => {
    const sessions = makeSessions();
    const result = listByVisibility(sessions, 'public');
    expect(result).toContain('personal');
    expect(result).toContain('novis');
    expect(result).not.toContain('work');
  });

  test('returns hidden sessions', () => {
    const sessions = makeSessions();
    expect(listByVisibility(sessions, 'hidden')).toEqual(['secret']);
  });

  test('throws on invalid visibility', () => {
    const sessions = makeSessions();
    expect(() => listByVisibility(sessions, 'top-secret')).toThrow('Invalid visibility');
  });
});
