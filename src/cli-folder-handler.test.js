const { setFolder, removeFolder, getFolder, listByFolder, getAllFolders } = require('./cli-folder-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], folder: 'dev' },
    personal: { urls: ['https://reddit.com'], folder: 'leisure' },
    misc: { urls: ['https://example.com'] },
  };
}

describe('setFolder', () => {
  it('sets folder on existing session', () => {
    const sessions = makeSessions();
    setFolder(sessions, 'misc', 'other');
    expect(sessions.misc.folder).toBe('other');
  });

  it('throws if session not found', () => {
    expect(() => setFolder({}, 'nope', 'x')).toThrow('Session "nope" not found');
  });
});

describe('removeFolder', () => {
  it('removes folder from session', () => {
    const sessions = makeSessions();
    removeFolder(sessions, 'work');
    expect(sessions.work.folder).toBeUndefined();
  });

  it('throws if session not found', () => {
    expect(() => removeFolder({}, 'nope')).toThrow('Session "nope" not found');
  });
});

describe('getFolder', () => {
  it('returns folder name', () => {
    const sessions = makeSessions();
    expect(getFolder(sessions, 'work')).toBe('dev');
  });

  it('returns null when no folder set', () => {
    const sessions = makeSessions();
    expect(getFolder(sessions, 'misc')).toBeNull();
  });

  it('throws if session not found', () => {
    expect(() => getFolder({}, 'nope')).toThrow('Session "nope" not found');
  });
});

describe('listByFolder', () => {
  it('returns sessions in given folder', () => {
    const sessions = makeSessions();
    expect(listByFolder(sessions, 'dev')).toEqual(['work']);
  });

  it('returns empty array for unknown folder', () => {
    expect(listByFolder(makeSessions(), 'unknown')).toEqual([]);
  });
});

describe('getAllFolders', () => {
  it('returns sorted unique folder names', () => {
    const sessions = makeSessions();
    expect(getAllFolders(sessions)).toEqual(['dev', 'leisure']);
  });

  it('returns empty array when no folders', () => {
    expect(getAllFolders({ a: { urls: [] } })).toEqual([]);
  });
});
