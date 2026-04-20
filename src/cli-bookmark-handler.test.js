const { addBookmark, removeBookmark, listBookmarks } = require('./cli-bookmark-handler');

describe('bookmark handler edge cases', () => {
  it('allows multiple bookmarks in a session', () => {
    const sessions = {
      research: {
        urls: ['https://a.com', 'https://b.com', 'https://c.com'],
        bookmarks: ['https://a.com']
      }
    };
    addBookmark(sessions, 'research', 'https://b.com');
    addBookmark(sessions, 'research', 'https://c.com');
    expect(sessions.research.bookmarks).toHaveLength(3);
  });

  it('removeBookmark leaves other bookmarks intact', () => {
    const sessions = {
      research: {
        urls: ['https://a.com', 'https://b.com'],
        bookmarks: ['https://a.com', 'https://b.com']
      }
    };
    removeBookmark(sessions, 'research', 'https://a.com');
    expect(sessions.research.bookmarks).toEqual(['https://b.com']);
  });

  it('listBookmarks returns all bookmarks in order', () => {
    const sessions = {
      work: {
        urls: ['https://x.com', 'https://y.com'],
        bookmarks: ['https://x.com', 'https://y.com']
      }
    };
    const result = listBookmarks(sessions, 'work');
    expect(result).toEqual(['https://x.com', 'https://y.com']);
  });

  it('addBookmark does not affect other sessions', () => {
    const sessions = {
      s1: { urls: ['https://a.com'], bookmarks: [] },
      s2: { urls: ['https://b.com'], bookmarks: [] }
    };
    addBookmark(sessions, 's1', 'https://a.com');
    expect(sessions.s2.bookmarks).toEqual([]);
  });
});
