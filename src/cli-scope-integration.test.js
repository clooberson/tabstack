const { setScope, removeScope, getScope, listByScope } = require('./cli-scope-handler');

test('full scope lifecycle: set, get, list, remove', () => {
  const sessions = {
    alpha: { urls: ['https://alpha.com'] },
    beta: { urls: ['https://beta.com'] },
    gamma: { urls: ['https://gamma.com'] }
  };

  setScope(sessions, 'alpha', 'work');
  setScope(sessions, 'beta', 'work');
  setScope(sessions, 'gamma', 'personal');

  expect(getScope(sessions, 'alpha')).toBe('work');
  expect(getScope(sessions, 'gamma')).toBe('personal');

  const workSessions = listByScope(sessions, 'work');
  expect(workSessions).toHaveLength(2);
  expect(workSessions.map(s => s.name)).toContain('alpha');
  expect(workSessions.map(s => s.name)).toContain('beta');

  removeScope(sessions, 'alpha');
  expect(getScope(sessions, 'alpha')).toBeNull();

  const workAfterRemove = listByScope(sessions, 'work');
  expect(workAfterRemove).toHaveLength(1);
  expect(workAfterRemove[0].name).toBe('beta');
});

test('overwriting an existing scope', () => {
  const sessions = { s1: { urls: [], scope: 'personal' } };
  setScope(sessions, 's1', 'work');
  expect(sessions.s1.scope).toBe('work');
});
