const { setTheme, removeTheme, getTheme, listByTheme, VALID_THEMES } = require('./cli-theme-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], theme: 'dark' },
    personal: { urls: ['https://example.com'] },
    research: { urls: ['https://arxiv.org'], theme: 'solarized' },
  };
}

describe('setTheme', () => {
  test('sets a valid theme on a session', () => {
    const sessions = makeSessions();
    const updated = setTheme(sessions, 'personal', 'nord');
    expect(updated.personal.theme).toBe('nord');
  });

  test('overwrites existing theme', () => {
    const sessions = makeSessions();
    const updated = setTheme(sessions, 'work', 'light');
    expect(updated.work.theme).toBe('light');
  });

  test('throws on invalid theme', () => {
    const sessions = makeSessions();
    expect(() => setTheme(sessions, 'work', 'rainbow')).toThrow('Invalid theme');
  });

  test('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => setTheme(sessions, 'missing', 'dark')).toThrow('not found');
  });
});

describe('removeTheme', () => {
  test('removes theme from session', () => {
    const sessions = makeSessions();
    const updated = removeTheme(sessions, 'work');
    expect(updated.work.theme).toBeUndefined();
  });

  test('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => removeTheme(sessions, 'ghost')).toThrow('not found');
  });
});

describe('getTheme', () => {
  test('returns theme if set', () => {
    const sessions = makeSessions();
    expect(getTheme(sessions, 'work')).toBe('dark');
  });

  test('returns null if no theme set', () => {
    const sessions = makeSessions();
    expect(getTheme(sessions, 'personal')).toBeNull();
  });

  test('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => getTheme(sessions, 'nope')).toThrow('not found');
  });
});

describe('listByTheme', () => {
  test('returns sessions matching theme', () => {
    const sessions = makeSessions();
    const results = listByTheme(sessions, 'dark');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('work');
  });

  test('returns empty array if no matches', () => {
    const sessions = makeSessions();
    expect(listByTheme(sessions, 'monokai')).toEqual([]);
  });
});

describe('VALID_THEMES', () => {
  test('includes expected themes', () => {
    expect(VALID_THEMES).toContain('dark');
    expect(VALID_THEMES).toContain('light');
    expect(VALID_THEMES).toContain('default');
  });
});
