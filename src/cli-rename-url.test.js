const { Command } = require('commander');
const { renameUrl, registerRenameUrlCommand } = require('./cli-rename-url-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerRenameUrlCommand(program);
  return program;
}

const baseSessions = () => ({
  work: {
    name: 'work',
    urls: ['https://github.com', 'https://slack.com'],
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
});

describe('renameUrl', () => {
  beforeEach(() => jest.clearAllMocks());

  it('replaces the url in the session', () => {
    const sessions = baseSessions();
    storage.readSessions.mockReturnValue(sessions);
    storage.getSession.mockImplementation((s, name) => s[name]);
    storage.writeSessions.mockImplementation(() => {});

    const result = renameUrl('work', 'https://slack.com', 'https://notion.so');
    expect(result.urls).toContain('https://notion.so');
    expect(result.urls).not.toContain('https://slack.com');
    expect(storage.writeSessions).toHaveBeenCalled();
  });

  it('throws if session not found', () => {
    storage.readSessions.mockReturnValue({});
    storage.getSession.mockReturnValue(undefined);
    expect(() => renameUrl('nope', 'a', 'b')).toThrow('not found');
  });

  it('throws if url not in session', () => {
    const sessions = baseSessions();
    storage.readSessions.mockReturnValue(sessions);
    storage.getSession.mockImplementation((s, name) => s[name]);
    expect(() => renameUrl('work', 'https://missing.com', 'https://new.com')).toThrow('not found in session');
  });
});

describe('registerRenameUrlCommand', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls renameUrl and logs success', async () => {
    const sessions = baseSessions();
    storage.readSessions.mockReturnValue(sessions);
    storage.getSession.mockImplementation((s, name) => s[name]);
    storage.writeSessions.mockImplementation(() => {});

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'rename-url', 'work', 'https://slack.com', 'https://notion.so']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Replaced'));
    consoleSpy.mockRestore();
  });
});
