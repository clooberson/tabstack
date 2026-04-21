const { setNamespace, removeNamespace, listByNamespace, getAllNamespaces } = require('./cli-namespace-handler');

test('full namespace lifecycle on a session set', () => {
  let sessions = {
    s1: { urls: ['https://one.com'] },
    s2: { urls: ['https://two.com'] },
    s3: { urls: ['https://three.com'] },
  };

  // assign namespaces
  sessions = setNamespace(sessions, 's1', 'frontend');
  sessions = setNamespace(sessions, 's2', 'backend');

  expect(getAllNamespaces(sessions)).toEqual(['backend', 'frontend']);

  let front = listByNamespace(sessions, 'frontend');
  expect(front).toHaveLength(1);
  expect(front[0].name).toBe('s1');

  let unns = listByNamespace(sessions, undefined);
  expect(unns).toHaveLength(1);
  expect(unns[0].name).toBe('s3');

  // remove a namespace
  sessions = removeNamespace(sessions, 's1');
  expect(sessions.s1.namespace).toBeUndefined();

  unns = listByNamespace(sessions, undefined);
  expect(unns.map(r => r.name)).toContain('s1');
  expect(unns.map(r => r.name)).toContain('s3');

  expect(getAllNamespaces(sessions)).toEqual(['backend']);
});
