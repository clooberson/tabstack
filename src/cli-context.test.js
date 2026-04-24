const { setContext, removeContext, getContext, listByContext } = require('./cli-context-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], context: 'development', updatedAt: '' },
    personal: { urls: ['https://reddit.com'], updatedAt: '' },
    research: { urls: ['https://arxiv.org'], context: 'development', updatedAt: '' },
  };
}

describe('setContext', () => {
  it('sets context on a session', () => {
    const sessions = makeSessions();
    const updated = setContext(sessions, 'personal', 'leisure');
    expect(updated.personal.context).toBe('leisure');
  });

  it('updates updatedAt', () => {
    const sessions = makeSessions();
    const before = sessions.work.updatedAt;
    const updated = setContext(sessions, 'work', 'ops');
    expect(updated.work.updatedAt).not.toBe(before);
  });

  it('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => setContext(sessions, 'missing', 'x')).toThrow('Session "missing" not found');
  });
});

describe('removeContext', () => {
  it('removes context from a session', () => {
    const sessions = makeSessions();
    const updated = removeContext(sessions, 'work');
    expect(updated.work.context).toBeUndefined();
  });

  it('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => removeContext(sessions, 'ghost')).toThrow('Session "ghost" not found');
  });
});

describe('getContext', () => {
  it('returns context for a session', () => {
    const sessions = makeSessions();
    expect(getContext(sessions, 'work')).toBe('development');
  });

  it('returns null if no context set', () => {
    const sessions = makeSessions();
    expect(getContext(sessions, 'personal')).toBeNull();
  });

  it('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => getContext(sessions, 'nope')).toThrow('Session "nope" not found');
  });
});

describe('listByContext', () => {
  it('returns sessions matching the given context', () => {
    const sessions = makeSessions();
    const result = listByContext(sessions, 'development');
    expect(result.map(r => r.name).sort()).toEqual(['research', 'work']);
  });

  it('returns empty array if no matches', () => {
    const sessions = makeSessions();
    expect(listByContext(sessions, 'unknown')).toEqual([]);
  });
});
