const { setPriority, clearPriority, listByPriority } = require('./cli-priority-handler');

describe('priority integration: full workflow', () => {
  test('set, list, then clear priority on a session', () => {
    let sessions = {
      docs: { urls: ['https://docs.example.com', 'https://wiki.example.com'] },
      news: { urls: ['https://news.ycombinator.com'] },
    };

    sessions = setPriority(sessions, 'docs', 'critical');
    sessions = setPriority(sessions, 'news', 'low');

    let listed = listByPriority(sessions);
    expect(listed.length).toBe(2);
    expect(listed[0].name).toBe('docs');
    expect(listed[0].priority).toBe('critical');

    sessions = clearPriority(sessions, 'docs');
    listed = listByPriority(sessions);
    expect(listed.length).toBe(1);
    expect(listed[0].name).toBe('news');
  });

  test('overwriting priority updates sort order', () => {
    let sessions = {
      a: { urls: ['https://a.com'], priority: 'low' },
      b: { urls: ['https://b.com'], priority: 'high' },
    };

    sessions = setPriority(sessions, 'a', 'critical');
    const listed = listByPriority(sessions);
    expect(listed[0].name).toBe('a');
  });

  test('listByPriority returns correct url counts', () => {
    const sessions = {
      multi: { urls: ['https://one.com', 'https://two.com', 'https://three.com'], priority: 'medium' },
    };
    const results = listByPriority(sessions, 'medium');
    expect(results[0].urls.length).toBe(3);
  });
});
