const { setOwner, removeOwner, getOwner, listByOwner, getAllOwners } = require('./cli-owner-handler');

function makeSessions() {
  return {
    alpha: { urls: ['https://a.com'], owner: 'alice' },
    beta: { urls: ['https://b.com'], owner: 'bob' },
    gamma: { urls: ['https://c.com'] },
  };
}

describe('setOwner', () => {
  it('sets owner on existing session', () => {
    const sessions = makeSessions();
    const result = setOwner(sessions, 'gamma', 'carol');
    expect(result.gamma.owner).toBe('carol');
  });

  it('overwrites existing owner', () => {
    const sessions = makeSessions();
    const result = setOwner(sessions, 'alpha', 'dave');
    expect(result.alpha.owner).toBe('dave');
  });

  it('throws for missing session', () => {
    const sessions = makeSessions();
    expect(() => setOwner(sessions, 'nope', 'x')).toThrow('not found');
  });
});

describe('removeOwner', () => {
  it('removes owner from session', () => {
    const sessions = makeSessions();
    const result = removeOwner(sessions, 'alpha');
    expect(result.alpha.owner).toBeUndefined();
  });

  it('throws for missing session', () => {
    const sessions = makeSessions();
    expect(() => removeOwner(sessions, 'nope')).toThrow('not found');
  });
});

describe('getOwner', () => {
  it('returns owner when set', () => {
    const sessions = makeSessions();
    expect(getOwner(sessions, 'alpha')).toBe('alice');
  });

  it('returns null when no owner', () => {
    const sessions = makeSessions();
    expect(getOwner(sessions, 'gamma')).toBeNull();
  });

  it('throws for missing session', () => {
    const sessions = makeSessions();
    expect(() => getOwner(sessions, 'nope')).toThrow('not found');
  });
});

describe('listByOwner', () => {
  it('returns sessions matching owner', () => {
    const sessions = makeSessions();
    const result = listByOwner(sessions, 'alice');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('alpha');
  });

  it('returns empty array when no match', () => {
    const sessions = makeSessions();
    expect(listByOwner(sessions, 'unknown')).toEqual([]);
  });
});

describe('getAllOwners', () => {
  it('returns sorted unique owners', () => {
    const sessions = makeSessions();
    const owners = getAllOwners(sessions);
    expect(owners).toEqual(['alice', 'bob']);
  });

  it('returns empty array when no owners set', () => {
    expect(getAllOwners({ x: { urls: [] } })).toEqual([]);
  });
});
