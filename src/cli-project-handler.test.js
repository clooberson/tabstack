const { setProject, removeProject, getProject, listByProject, getAllProjects } = require('./cli-project-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com', 'https://jira.com'], project: 'alpha' },
    personal: { urls: ['https://reddit.com'], project: 'personal' },
    research: { urls: ['https://arxiv.org'], project: 'alpha' },
    misc: { urls: ['https://example.com'] },
  };
}

describe('setProject', () => {
  it('sets a project on a session', () => {
    const sessions = makeSessions();
    const updated = setProject(sessions, 'misc', 'beta');
    expect(updated.misc.project).toBe('beta');
  });

  it('throws if session not found', () => {
    expect(() => setProject(makeSessions(), 'nope', 'x')).toThrow('not found');
  });
});

describe('removeProject', () => {
  it('removes project from session', () => {
    const sessions = makeSessions();
    const updated = removeProject(sessions, 'work');
    expect(updated.work.project).toBeUndefined();
  });

  it('throws if session not found', () => {
    expect(() => removeProject(makeSessions(), 'ghost')).toThrow('not found');
  });
});

describe('getProject', () => {
  it('returns the project for a session', () => {
    expect(getProject(makeSessions(), 'work')).toBe('alpha');
  });

  it('returns null if no project set', () => {
    expect(getProject(makeSessions(), 'misc')).toBeNull();
  });

  it('throws if session not found', () => {
    expect(() => getProject(makeSessions(), 'unknown')).toThrow('not found');
  });
});

describe('listByProject', () => {
  it('returns sessions matching the project', () => {
    const results = listByProject(makeSessions(), 'alpha');
    const names = results.map(r => r.name);
    expect(names).toContain('work');
    expect(names).toContain('research');
    expect(names).not.toContain('personal');
  });

  it('returns empty array if no matches', () => {
    expect(listByProject(makeSessions(), 'nonexistent')).toEqual([]);
  });
});

describe('getAllProjects', () => {
  it('returns sorted unique project names', () => {
    const projects = getAllProjects(makeSessions());
    expect(projects).toEqual(['alpha', 'personal']);
  });

  it('returns empty array when no projects set', () => {
    expect(getAllProjects({ a: { urls: [] } })).toEqual([]);
  });
});
