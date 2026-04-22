const { setScope, removeScope, getScope, listByScope } = require('./cli-scope-handler');

function makeSessions() {
  return {
    work: { urls: ['https://jira.com', 'https://github.com'], scope: 'work' },
    personal: { urls: ['https://reddit.com'], scope: 'personal' },
    unsorted: { urls: ['https://example.com'] }
  };
}

test('setScope sets valid scope', () => {
  const sessions = makeSessions();
  setScope(sessions, 'unsorted', 'project');
  expect(sessions.unsorted.scope).toBe('project');
});

test('setScope throws for unknown session', () => {
  const sessions = makeSessions();
  expect(() => setScope(sessions, 'ghost', 'work')).toThrow('not found');
});

test('setScope throws for invalid scope', () => {
  const sessions = makeSessions();
  expect(() => setScope(sessions, 'unsorted', 'banana')).toThrow('Invalid scope');
});

test('removeScope deletes scope field', () => {
  const sessions = makeSessions();
  removeScope(sessions, 'work');
  expect(sessions.work.scope).toBeUndefined();
});

test('removeScope throws for unknown session', () => {
  const sessions = makeSessions();
  expect(() => removeScope(sessions, 'ghost')).toThrow('not found');
});

test('getScope returns current scope', () => {
  const sessions = makeSessions();
  expect(getScope(sessions, 'work')).toBe('work');
});

test('getScope returns null when no scope set', () => {
  const sessions = makeSessions();
  expect(getScope(sessions, 'unsorted')).toBeNull();
});

test('listByScope returns matching sessions', () => {
  const sessions = makeSessions();
  const results = listByScope(sessions, 'personal');
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('personal');
});

test('listByScope returns empty array when none match', () => {
  const sessions = makeSessions();
  const results = listByScope(sessions, 'shared');
  expect(results).toHaveLength(0);
});
