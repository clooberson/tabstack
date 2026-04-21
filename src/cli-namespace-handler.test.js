const { setNamespace, removeNamespace, listByNamespace, getAllNamespaces } = require('./cli-namespace-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com', 'https://jira.com'], namespace: 'dev' },
    personal: { urls: ['https://reddit.com'], namespace: 'leisure' },
    misc: { urls: ['https://example.com'] },
  };
}

test('setNamespace assigns namespace to existing session', () => {
  const sessions = makeSessions();
  setNamespace(sessions, 'misc', 'temp');
  expect(sessions.misc.namespace).toBe('temp');
});

test('setNamespace throws for unknown session', () => {
  expect(() => setNamespace(makeSessions(), 'ghost', 'x')).toThrow('not found');
});

test('setNamespace with null clears namespace', () => {
  const sessions = makeSessions();
  setNamespace(sessions, 'work', null);
  expect(sessions.work.namespace).toBeNull();
});

test('removeNamespace deletes namespace key', () => {
  const sessions = makeSessions();
  removeNamespace(sessions, 'work');
  expect(sessions.work.namespace).toBeUndefined();
});

test('removeNamespace throws for unknown session', () => {
  expect(() => removeNamespace(makeSessions(), 'nope')).toThrow('not found');
});

test('listByNamespace returns sessions in given namespace', () => {
  const results = listByNamespace(makeSessions(), 'dev');
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('work');
});

test('listByNamespace with no arg returns unnamespaced sessions', () => {
  const results = listByNamespace(makeSessions(), undefined);
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('misc');
});

test('getAllNamespaces returns sorted unique namespaces', () => {
  const ns = getAllNamespaces(makeSessions());
  expect(ns).toEqual(['dev', 'leisure']);
});

test('getAllNamespaces returns empty array when none set', () => {
  const sessions = { a: { urls: [] }, b: { urls: [] } };
  expect(getAllNamespaces(sessions)).toEqual([]);
});
