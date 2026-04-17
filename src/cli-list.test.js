const { Command } = require('commander');
const { registerListCommand } = require('./cli-list');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerListCommand(program);
  return program;
}

describe('list command', () => {
  beforeEach(() => jest.clearAllMocks());

  test('shows message when no sessions exist', () => {
    storage.listSessions.mockReturnValue([]);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No saved sessions.');
    spy.mockRestore();
  });

  test('lists sessions with tab count and date', () => {
    storage.listSessions.mockReturnValue([
      { name: 'work', urls: ['https://a.com', 'https://b.com'], savedAt: '2024-01-01T10:00:00.000Z' },
    ]);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('1 session'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('work'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('2 tab(s)'));
    spy.mockRestore();
  });

  test('deletes a session by name', () => {
    storage.deleteSession.mockReturnValue(true);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['list', '--delete', 'work'], { from: 'user' });
    expect(storage.deleteSession).toHaveBeenCalledWith('work');
    expect(spy).toHaveBeenCalledWith('Session "work" deleted.');
    spy.mockRestore();
  });

  test('errors when deleting non-existent session', () => {
    storage.deleteSession.mockReturnValue(false);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    makeProgram().parse(['list', '--delete', 'ghost'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('Session "ghost" not found.');
    expect(mockExit).toHaveBeenCalledWith(1);
    spy.mockRestore();
    mockExit.mockRestore();
  });
});
