const { setLabel, removeLabel, getLabel, listByLabel } = require('./cli-label-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com', 'https://jira.com'], label: 'Work Stuff' },
    personal: { urls: ['https://reddit.com'] },
    research: { urls: ['https://arxiv.org'], label: 'Work Stuff' },
  };
}

describe('setLabel', () => {
  it('sets a label on an existing session', () => {
    const sessions = makeSessions();
    const result = setLabel(sessions, 'personal', 'Fun');
    expect(result.personal.label).toBe('Fun');
  });

  it('overwrites an existing label', () => {
    const sessions = makeSessions();
    const result = setLabel(sessions, 'work', 'Updated');
    expect(result.work.label).toBe('Updated');
  });

  it('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => setLabel(sessions, 'nope', 'x')).toThrow('not found');
  });
});

describe('removeLabel', () => {
  it('removes the label from a session', () => {
    const sessions = makeSessions();
    const result = removeLabel(sessions, 'work');
    expect(result.work.label).toBeUndefined();
  });

  it('does not error if no label was set', () => {
    const sessions = makeSessions();
    expect(() => removeLabel(sessions, 'personal')).not.toThrow();
  });

  it('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => removeLabel(sessions, 'ghost')).toThrow('not found');
  });
});

describe('getLabel', () => {
  it('returns the label if set', () => {
    const sessions = makeSessions();
    expect(getLabel(sessions, 'work')).toBe('Work Stuff');
  });

  it('returns null if no label', () => {
    const sessions = makeSessions();
    expect(getLabel(sessions, 'personal')).toBeNull();
  });

  it('throws if session not found', () => {
    const sessions = makeSessions();
    expect(() => getLabel(sessions, 'missing')).toThrow('not found');
  });
});

describe('listByLabel', () => {
  it('returns sessions matching the label', () => {
    const sessions = makeSessions();
    const results = listByLabel(sessions, 'Work Stuff');
    expect(results).toHaveLength(2);
    expect(results.map(r => r.name)).toEqual(expect.arrayContaining(['work', 'research']));
  });

  it('returns empty array if no matches', () => {
    const sessions = makeSessions();
    expect(listByLabel(sessions, 'Nonexistent')).toEqual([]);
  });
});
