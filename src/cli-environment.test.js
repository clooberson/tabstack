const { setEnvironment, removeEnvironment, getEnvironment, listByEnvironment } = require('./cli-environment-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com', 'https://jira.com'], environment: 'development' },
    prod: { urls: ['https://app.example.com'], environment: 'production' },
    misc: { urls: ['https://news.ycombinator.com'] },
  };
}

describe('setEnvironment', () => {
  it('sets a valid environment on a session', () => {
    const sessions = makeSessions();
    const result = setEnvironment(sessions, 'misc', 'staging');
    expect(result.misc.environment).toBe('staging');
  });

  it('throws for unknown session', () => {
    const sessions = makeSessions();
    expect(() => setEnvironment(sessions, 'nope', 'local')).toThrow('not found');
  });

  it('throws for invalid environment value', () => {
    const sessions = makeSessions();
    expect(() => setEnvironment(sessions, 'work', 'cloud')).toThrow('Invalid environment');
  });

  it('overwrites existing environment', () => {
    const sessions = makeSessions();
    const result = setEnvironment(sessions, 'work', 'production');
    expect(result.work.environment).toBe('production');
  });
});

describe('removeEnvironment', () => {
  it('removes environment from a session', () => {
    const sessions = makeSessions();
    const result = removeEnvironment(sessions, 'work');
    expect(result.work.environment).toBeUndefined();
  });

  it('throws for unknown session', () => {
    const sessions = makeSessions();
    expect(() => removeEnvironment(sessions, 'ghost')).toThrow('not found');
  });
});

describe('getEnvironment', () => {
  it('returns environment for a session', () => {
    const sessions = makeSessions();
    expect(getEnvironment(sessions, 'work')).toBe('development');
  });

  it('returns null if no environment set', () => {
    const sessions = makeSessions();
    expect(getEnvironment(sessions, 'misc')).toBeNull();
  });

  it('throws for unknown session', () => {
    const sessions = makeSessions();
    expect(() => getEnvironment(sessions, 'nope')).toThrow('not found');
  });
});

describe('listByEnvironment', () => {
  it('returns sessions matching the given environment', () => {
    const sessions = makeSessions();
    const result = listByEnvironment(sessions, 'development');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('work');
  });

  it('returns empty array if no matches', () => {
    const sessions = makeSessions();
    const result = listByEnvironment(sessions, 'local');
    expect(result).toHaveLength(0);
  });

  it('returns multiple matches', () => {
    const sessions = makeSessions();
    setEnvironment(sessions, 'misc', 'production');
    const result = listByEnvironment(sessions, 'production');
    expect(result).toHaveLength(2);
  });
});
