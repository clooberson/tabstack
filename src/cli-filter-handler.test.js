const { filterSessions } = require('./cli-filter-handler');

const sessions = {
  work: { urls: ['https://github.com', 'https://jira.com'], tags: ['work'], favorite: true },
  personal: { urls: ['https://reddit.com'], tags: ['fun'], favorite: false },
  research: { urls: ['https://arxiv.org', 'https://scholar.google.com', 'https://pubmed.gov'], tags: ['work', 'research'], favorite: false },
};

describe('filterSessions', () => {
  test('returns all sessions when no filters applied', () => {
    const result = filterSessions(sessions, {});
    expect(Object.keys(result)).toHaveLength(3);
  });

  test('filters by tag', () => {
    const result = filterSessions(sessions, { tag: 'work' });
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['work', 'research']));
    expect(Object.keys(result)).not.toContain('personal');
  });

  test('filters by minUrls', () => {
    const result = filterSessions(sessions, { minUrls: 2 });
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['work', 'research']));
    expect(Object.keys(result)).not.toContain('personal');
  });

  test('filters by maxUrls', () => {
    const result = filterSessions(sessions, { maxUrls: 1 });
    expect(Object.keys(result)).toEqual(['personal']);
  });

  test('filters by search keyword in name', () => {
    const result = filterSessions(sessions, { search: 'res' });
    expect(Object.keys(result)).toContain('research');
  });

  test('filters by search keyword in url', () => {
    const result = filterSessions(sessions, { search: 'github' });
    expect(Object.keys(result)).toEqual(['work']);
  });

  test('filters favorites', () => {
    const result = filterSessions(sessions, { favorites: true });
    expect(Object.keys(result)).toEqual(['work']);
  });

  test('combines multiple filters', () => {
    const result = filterSessions(sessions, { tag: 'work', minUrls: 3 });
    expect(Object.keys(result)).toEqual(['research']);
  });

  test('returns empty when nothing matches', () => {
    const result = filterSessions(sessions, { tag: 'nonexistent' });
    expect(Object.keys(result)).toHaveLength(0);
  });
});
