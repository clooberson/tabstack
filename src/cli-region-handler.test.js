const { setRegion, removeRegion, getRegion, listByRegion, getAllRegions } = require('./cli-region-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], region: 'us' },
    travel: { urls: ['https://maps.google.com'], region: 'eu' },
    local: { urls: ['https://localhost:3000'] },
  };
}

describe('setRegion', () => {
  test('sets a valid region', () => {
    const sessions = makeSessions();
    setRegion(sessions, 'local', 'asia');
    expect(sessions.local.region).toBe('asia');
  });

  test('throws for unknown session', () => {
    expect(() => setRegion({}, 'ghost', 'us')).toThrow('not found');
  });

  test('throws for invalid region', () => {
    const sessions = makeSessions();
    expect(() => setRegion(sessions, 'work', 'mars')).toThrow('Invalid region');
  });

  test('normalizes region to lowercase', () => {
    const sessions = makeSessions();
    setRegion(sessions, 'work', 'EU');
    expect(sessions.work.region).toBe('eu');
  });
});

describe('removeRegion', () => {
  test('removes existing region', () => {
    const sessions = makeSessions();
    removeRegion(sessions, 'work');
    expect(sessions.work.region).toBeUndefined();
  });

  test('throws for unknown session', () => {
    expect(() => removeRegion({}, 'ghost')).toThrow('not found');
  });
});

describe('getRegion', () => {
  test('returns region when set', () => {
    const sessions = makeSessions();
    expect(getRegion(sessions, 'work')).toBe('us');
  });

  test('returns null when no region', () => {
    const sessions = makeSessions();
    expect(getRegion(sessions, 'local')).toBeNull();
  });

  test('throws for unknown session', () => {
    expect(() => getRegion({}, 'ghost')).toThrow('not found');
  });
});

describe('listByRegion', () => {
  test('returns sessions matching region', () => {
    const sessions = makeSessions();
    const result = listByRegion(sessions, 'us');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('work');
  });

  test('returns empty array when no match', () => {
    const sessions = makeSessions();
    expect(listByRegion(sessions, 'au')).toHaveLength(0);
  });
});

describe('getAllRegions', () => {
  test('groups sessions by region', () => {
    const sessions = makeSessions();
    const result = getAllRegions(sessions);
    expect(result.us).toContain('work');
    expect(result.eu).toContain('travel');
    expect(result.global).toBeUndefined();
  });

  test('returns empty object when no regions set', () => {
    expect(getAllRegions({ a: { urls: [] } })).toEqual({});
  });
});
