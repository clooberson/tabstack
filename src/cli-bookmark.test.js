const { Command } = require('commander');
const { addBookmark, removeBookmark, listBookmarks, registerBookmarkCommand } = require('./cli-bookmark-handler');

function makeProgram(sessions) {
  const { readSessions, writeSessions } = require('./storage');
  jest.mock('./storage');
  readSessions.mockReturnValue(sessions);
  writeSessions.mockImplementation(() => {});
  const program = new Command();
  program.exitOverride();
  registerBookmarkCommand(program);
  return program;
}

describe('addBookmark', () => {
  it('adds a bookmark to a session', () => {
    const sessions = { work: { urls: ['https://github.com'], bookmarks: [] } };
    addBookmark(sessions, 'work', 'https://github.com');
    expect(sessions.work.bookmarks).toContain('https://github.com');
  });

  it('throws if session not found', () => {
    expect(() => addBookmark({}, 'missing', 'https://x.com')).toThrow('not found');
  });

  it('throws if url not in session', () => {
    const sessions = { work: { urls: [], bookmarks: [] } };
    expect(() => addBookmark(sessions, 'work', 'https://x.com')).toThrow('not in session');
  });

  it('throws if url already bookmarked', () => {
    const sessions = { work: { urls: ['https://x.com'], bookmarks: ['https://x.com'] } };
    expect(() => addBookmark(sessions, 'work', 'https://x.com')).toThrow('already bookmarked');
  });

  it('initializes bookmarks array if missing', () => {
    const sessions = { work: { urls: ['https://github.com'] } };
    addBookmark(sessions, 'work', 'https://github.com');
    expect(sessions.work.bookmarks).toEqual(['https://github.com']);
  });
});

describe('removeBookmark', () => {
  it('removes a bookmark', () => {
    const sessions = { work: { urls: ['https://github.com'], bookmarks: ['https://github.com'] } };
    removeBookmark(sessions, 'work', 'https://github.com');
    expect(sessions.work.bookmarks).toEqual([]);
  });

  it('throws if url not bookmarked', () => {
    const sessions = { work: { urls: ['https://x.com'], bookmarks: [] } };
    expect(() => removeBookmark(sessions, 'work', 'https://x.com')).toThrow('not bookmarked');
  });

  it('throws if session not found', () => {
    expect(() => removeBookmark({}, 'missing', 'https://x.com')).toThrow('not found');
  });
});

describe('listBookmarks', () => {
  it('returns bookmarks for a session', () => {
    const sessions = { work: { urls: ['https://github.com'], bookmarks: ['https://github.com'] } };
    expect(listBookmarks(sessions, 'work')).toEqual(['https://github.com']);
  });

  it('returns empty array if no bookmarks', () => {
    const sessions = { work: { urls: [] } };
    expect(listBookmarks(sessions, 'work')).toEqual([]);
  });

  it('throws if session not found', () => {
    expect(() => listBookmarks({}, 'missing')).toThrow('not found');
  });
});
