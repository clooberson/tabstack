const { setMilestone, removeMilestone, getMilestone, listByMilestone, getAllMilestones } = require('./cli-milestone-handler');

function makeSessions() {
  return {
    alpha: { urls: ['https://a.com'], milestone: 'v1.0', milestoneSetAt: '2024-01-01T00:00:00.000Z' },
    beta: { urls: ['https://b.com'], milestone: 'v2.0', milestoneSetAt: '2024-02-01T00:00:00.000Z' },
    gamma: { urls: ['https://c.com'] },
  };
}

describe('setMilestone', () => {
  it('sets milestone on existing session', () => {
    const sessions = makeSessions();
    setMilestone(sessions, 'gamma', 'v1.0');
    expect(sessions.gamma.milestone).toBe('v1.0');
    expect(sessions.gamma.milestoneSetAt).toBeDefined();
  });

  it('throws for unknown session', () => {
    expect(() => setMilestone(makeSessions(), 'nope', 'v1')).toThrow('not found');
  });
});

describe('removeMilestone', () => {
  it('removes milestone from session', () => {
    const sessions = makeSessions();
    removeMilestone(sessions, 'alpha');
    expect(sessions.alpha.milestone).toBeUndefined();
    expect(sessions.alpha.milestoneSetAt).toBeUndefined();
  });

  it('throws for unknown session', () => {
    expect(() => removeMilestone(makeSessions(), 'nope')).toThrow('not found');
  });
});

describe('getMilestone', () => {
  it('returns milestone for session', () => {
    expect(getMilestone(makeSessions(), 'alpha')).toBe('v1.0');
  });

  it('returns null when no milestone', () => {
    expect(getMilestone(makeSessions(), 'gamma')).toBeNull();
  });

  it('throws for unknown session', () => {
    expect(() => getMilestone(makeSessions(), 'nope')).toThrow('not found');
  });
});

describe('listByMilestone', () => {
  it('returns sessions matching milestone', () => {
    const results = listByMilestone(makeSessions(), 'v1.0');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('alpha');
  });

  it('returns empty array if no matches', () => {
    expect(listByMilestone(makeSessions(), 'v99')).toHaveLength(0);
  });
});

describe('getAllMilestones', () => {
  it('returns sorted unique milestones', () => {
    const all = getAllMilestones(makeSessions());
    expect(all).toEqual(['v1.0', 'v2.0']);
  });

  it('returns empty array when no milestones set', () => {
    expect(getAllMilestones({ x: { urls: [] } })).toEqual([]);
  });
});
