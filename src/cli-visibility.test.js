const { setVisibility, getVisibility, listByVisibility } = require('./cli-visibility-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], visibility: 'private' },
    personal: { urls: ['https://reddit.com'] },
    secret: { urls: ['https://example.com'], visibility: 'hidden' },
  };
}

describe('setVisibility', () => {
  it('sets visibility on an existing session', () => {
    const sessions = makeSessions();
    setVisibility(sessions, 'personal', 'private');
    expect(sessions.personal.visibility).toBe('private');
  });

  it('throws for unknown session', () => {
    const sessions = makeSessions();
    expect(() => setVisibility(sessions, 'nope', 'public')).toThrow('not found');
  });

  it('throws for invalid visibility value', () => {
    const sessions = makeSessions();
    expect(() => setVisibility(sessions, 'work', 'invisible')).toThrow('Invalid visibility');
  });

  it('accepts all valid visibility values', () => {
    const sessions = makeSessions();
    ['public', 'private', 'hidden'].forEach(v => {
      setVisibility(sessions, 'work', v);
      expect(sessions.work.visibility).toBe(v);
    });
  });
});

describe('getVisibility', () => {
  it('returns the visibility of a session', () => {
    const sessions = makeSessions();
    expect(getVisibility(sessions, 'work')).toBe('private');
  });

  it('defaults to public when not set', () => {
    const sessions = makeSessions();
    expect(getVisibility(sessions, 'personal')).toBe('public');
  });

  it('throws for unknown session', () => {
    const sessions = makeSessions();
    expect(() => getVisibility(sessions, 'ghost')).toThrow('not found');
  });
});

describe('listByVisibility', () => {
  it('returns sessions matching the visibility', () => {
    const sessions = makeSessions();
    const result = listByVisibility(sessions, 'hidden');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('secret');
  });

  it('treats missing visibility as public', () => {
    const sessions = makeSessions();
    const result = listByVisibility(sessions, 'public');
    expect(result.map(r => r.name)).toContain('personal');
  });

  it('returns empty array when no matches', () => {
    const sessions = makeSessions();
    const result = listByVisibility(sessions, 'public');
    expect(result.find(r => r.name === 'work')).toBeUndefined();
  });
});
