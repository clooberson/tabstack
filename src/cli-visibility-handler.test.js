const { setVisibility, getVisibility, listByVisibility } = require('./cli-visibility-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], visibility: 'private' },
    personal: { urls: ['https://reddit.com'], visibility: 'public' },
    secret: { urls: ['https://example.com'], visibility: 'hidden' },
    default: { urls: ['https://news.ycombinator.com'] },
  };
}

describe('setVisibility', () => {
  it('sets visibility on an existing session', () => {
    const sessions = makeSessions();
    const updated = setVisibility(sessions, 'work', 'public');
    expect(updated.work.visibility).toBe('public');
  });

  it('throws on unknown session', () => {
    expect(() => setVisibility(makeSessions(), 'nope', 'public')).toThrow('not found');
  });

  it('throws on invalid visibility value', () => {
    expect(() => setVisibility(makeSessions(), 'work', 'secret')).toThrow('Invalid visibility');
  });

  it('accepts all valid visibility values', () => {
    for (const v of ['public', 'private', 'hidden']) {
      const sessions = makeSessions();
      expect(() => setVisibility(sessions, 'work', v)).not.toThrow();
    }
  });
});

describe('getVisibility', () => {
  it('returns the visibility of a session', () => {
    expect(getVisibility(makeSessions(), 'work')).toBe('private');
  });

  it('defaults to public when not set', () => {
    expect(getVisibility(makeSessions(), 'default')).toBe('public');
  });

  it('throws on unknown session', () => {
    expect(() => getVisibility(makeSessions(), 'ghost')).toThrow('not found');
  });
});

describe('listByVisibility', () => {
  it('lists sessions matching given visibility', () => {
    const result = listByVisibility(makeSessions(), 'public');
    expect(result).toContain('personal');
    expect(result).toContain('default');
    expect(result).not.toContain('work');
  });

  it('lists hidden sessions', () => {
    const result = listByVisibility(makeSessions(), 'hidden');
    expect(result).toEqual(['secret']);
  });

  it('returns empty array when none match', () => {
    const sessions = { a: { urls: [], visibility: 'public' } };
    expect(listByVisibility(sessions, 'private')).toEqual([]);
  });

  it('throws on invalid visibility', () => {
    expect(() => listByVisibility(makeSessions(), 'unknown')).toThrow('Invalid visibility');
  });
});
