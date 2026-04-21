const { setPriority, clearPriority, listByPriority } = require('./cli-priority-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com', 'https://jira.com'], priority: 'high' },
    personal: { urls: ['https://reddit.com'], priority: 'low' },
    research: { urls: ['https://arxiv.org', 'https://scholar.google.com'], priority: 'critical' },
    misc: { urls: ['https://example.com'] },
  };
}

describe('setPriority', () => {
  test('sets a valid priority on an existing session', () => {
    const sessions = makeSessions();
    const updated = setPriority(sessions, 'misc', 'medium');
    expect(updated.misc.priority).toBe('medium');
  });

  test('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => setPriority(sessions, 'nope', 'high')).toThrow('not found');
  });

  test('throws for invalid priority value', () => {
    const sessions = makeSessions();
    expect(() => setPriority(sessions, 'work', 'urgent')).toThrow('Invalid priority');
  });

  test('overwrites existing priority', () => {
    const sessions = makeSessions();
    const updated = setPriority(sessions, 'work', 'low');
    expect(updated.work.priority).toBe('low');
  });
});

describe('clearPriority', () => {
  test('removes priority from session', () => {
    const sessions = makeSessions();
    const updated = clearPriority(sessions, 'work');
    expect(updated.work.priority).toBeUndefined();
  });

  test('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => clearPriority(sessions, 'ghost')).toThrow('not found');
  });

  test('does not fail if priority was already absent', () => {
    const sessions = makeSessions();
    expect(() => clearPriority(sessions, 'misc')).not.toThrow();
  });
});

describe('listByPriority', () => {
  test('returns only sessions with priority set when no filter given', () => {
    const sessions = makeSessions();
    const results = listByPriority(sessions);
    expect(results.map(r => r.name)).not.toContain('misc');
    expect(results.length).toBe(3);
  });

  test('filters by specific priority level', () => {
    const sessions = makeSessions();
    const results = listByPriority(sessions, 'high');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('work');
  });

  test('returns results sorted highest priority first', () => {
    const sessions = makeSessions();
    const results = listByPriority(sessions);
    expect(results[0].priority).toBe('critical');
  });

  test('throws for invalid priority filter', () => {
    const sessions = makeSessions();
    expect(() => listByPriority(sessions, 'extreme')).toThrow('Invalid priority');
  });

  test('returns empty array when no sessions match filter', () => {
    const sessions = makeSessions();
    const results = listByPriority(sessions, 'medium');
    expect(results).toEqual([]);
  });
});
