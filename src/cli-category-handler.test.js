const { setCategory, removeCategory, listByCategory, getAllCategories } = require('./cli-category-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com', 'https://jira.example.com'], category: 'work' },
    news: { urls: ['https://hn.com'], category: 'reading' },
    misc: { urls: ['https://example.com'] },
  };
}

describe('setCategory', () => {
  it('sets category on existing session', () => {
    const sessions = makeSessions();
    const result = setCategory(sessions, 'misc', 'personal');
    expect(result.misc.category).toBe('personal');
  });

  it('throws if session not found', () => {
    expect(() => setCategory(makeSessions(), 'nope', 'x')).toThrow('not found');
  });

  it('overwrites existing category', () => {
    const sessions = makeSessions();
    setCategory(sessions, 'work', 'personal');
    expect(sessions.work.category).toBe('personal');
  });
});

describe('removeCategory', () => {
  it('removes category from session', () => {
    const sessions = makeSessions();
    removeCategory(sessions, 'work');
    expect(sessions.work.category).toBeUndefined();
  });

  it('throws if session not found', () => {
    expect(() => removeCategory(makeSessions(), 'ghost')).toThrow('not found');
  });
});

describe('listByCategory', () => {
  it('returns sessions matching category', () => {
    const results = listByCategory(makeSessions(), 'work');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('work');
  });

  it('returns empty array if none match', () => {
    expect(listByCategory(makeSessions(), 'unknown')).toEqual([]);
  });
});

describe('getAllCategories', () => {
  it('returns sorted unique categories', () => {
    const cats = getAllCategories(makeSessions());
    expect(cats).toEqual(['reading', 'work']);
  });

  it('returns empty array when no categories', () => {
    expect(getAllCategories({ a: { urls: [] } })).toEqual([]);
  });
});
