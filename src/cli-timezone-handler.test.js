const { setTimezone, removeTimezone, getTimezone, listByTimezone } = require('./cli-timezone-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], timezone: 'America/New_York' },
    personal: { urls: ['https://reddit.com'] },
    travel: { urls: ['https://maps.google.com'], timezone: 'Europe/London' },
  };
}

describe('setTimezone', () => {
  it('sets a valid timezone on a session', () => {
    const sessions = makeSessions();
    const updated = setTimezone(sessions, 'personal', 'Asia/Tokyo');
    expect(updated.personal.timezone).toBe('Asia/Tokyo');
  });

  it('throws if session not found', () => {
    expect(() => setTimezone(makeSessions(), 'ghost', 'UTC')).toThrow('not found');
  });

  it('throws if timezone is invalid', () => {
    expect(() => setTimezone(makeSessions(), 'work', 'Mars/Olympus')).toThrow('Invalid timezone');
  });

  it('overwrites existing timezone', () => {
    const sessions = makeSessions();
    const updated = setTimezone(sessions, 'work', 'Pacific/Auckland');
    expect(updated.work.timezone).toBe('Pacific/Auckland');
  });
});

describe('removeTimezone', () => {
  it('removes timezone from a session', () => {
    const sessions = makeSessions();
    const updated = removeTimezone(sessions, 'work');
    expect(updated.work.timezone).toBeUndefined();
  });

  it('throws if session not found', () => {
    expect(() => removeTimezone(makeSessions(), 'nope')).toThrow('not found');
  });

  it('does not throw if timezone was not set', () => {
    const sessions = makeSessions();
    expect(() => removeTimezone(sessions, 'personal')).not.toThrow();
  });
});

describe('getTimezone', () => {
  it('returns the timezone if set', () => {
    expect(getTimezone(makeSessions(), 'work')).toBe('America/New_York');
  });

  it('returns null if no timezone set', () => {
    expect(getTimezone(makeSessions(), 'personal')).toBeNull();
  });

  it('throws if session not found', () => {
    expect(() => getTimezone(makeSessions(), 'missing')).toThrow('not found');
  });
});

describe('listByTimezone', () => {
  it('returns sessions matching the timezone', () => {
    const results = listByTimezone(makeSessions(), 'America/New_York');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('work');
  });

  it('returns empty array if no matches', () => {
    expect(listByTimezone(makeSessions(), 'Asia/Seoul')).toEqual([]);
  });

  it('returns multiple sessions with same timezone', () => {
    const sessions = makeSessions();
    sessions.remote = { urls: [], timezone: 'Europe/London' };
    const results = listByTimezone(sessions, 'Europe/London');
    expect(results).toHaveLength(2);
  });
});
