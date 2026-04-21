const { setExpiry, clearExpiry, listExpired } = require('./cli-expire-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], expiresAt: null },
    personal: { urls: ['https://reddit.com'] },
  };
}

describe('setExpiry', () => {
  it('sets expiresAt on a session', () => {
    const sessions = makeSessions();
    const result = setExpiry(sessions, 'work', '2099-01-01');
    expect(result['work'].expiresAt).toBe(new Date('2099-01-01').getTime());
  });

  it('throws if session not found', () => {
    expect(() => setExpiry(makeSessions(), 'missing', '2099-01-01')).toThrow('not found');
  });

  it('throws on invalid date', () => {
    expect(() => setExpiry(makeSessions(), 'work', 'not-a-date')).toThrow('Invalid date');
  });
});

describe('clearExpiry', () => {
  it('removes expiresAt from a session', () => {
    const sessions = makeSessions();
    setExpiry(sessions, 'work', '2099-01-01');
    const result = clearExpiry(sessions, 'work');
    expect(result['work'].expiresAt).toBeUndefined();
  });

  it('throws if session not found', () => {
    expect(() => clearExpiry(makeSessions(), 'ghost')).toThrow('not found');
  });
});

describe('listExpired', () => {
  it('returns sessions whose expiresAt is in the past', () => {
    const sessions = {
      old: { urls: [], expiresAt: Date.now() - 10000 },
      future: { urls: [], expiresAt: Date.now() + 10000 },
      none: { urls: [] },
    };
    const result = listExpired(sessions);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('old');
  });

  it('returns empty array when no sessions are expired', () => {
    const sessions = { fresh: { urls: [], expiresAt: Date.now() + 99999 } };
    expect(listExpired(sessions)).toEqual([]);
  });
});
