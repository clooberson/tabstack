const { Command } = require('commander');
const { registerRestoreCommand } = require('./cli-restore');

jest.mock('./restore');
jest.mock('./storage');

const { validateBrowser, restoreSession } = require('./restore');
const { getSession } = require('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerRestoreCommand(program);
  return program;
}

describe('restore command', () => {
  beforeEach(() => jest.clearAllMocks());

  test('restores a session with default browser', async () => {
    validateBrowser.mockReturnValue(null);
    getSession.mockReturnValue({ name: 'work', urls: ['https://a.com', 'https://b.com'] });
    restoreSession.mockResolvedValue();

    const program = makeProgram();
    await program.parseAsync(['restore', 'work'], { from: 'user' });

    expect(validateBrowser).toHaveBeenCalledWith('chrome');
    expect(getSession).toHaveBeenCalledWith('work');
    expect(restoreSession).toHaveBeenCalledWith(
      { name: 'work', urls: ['https://a.com', 'https://b.com'] },
      'chrome'
    );
  });

  test('restores a session with a custom browser', async () => {
    validateBrowser.mockReturnValue(null);
    getSession.mockReturnValue({ name: 'work', urls: ['https://a.com'] });
    restoreSession.mockResolvedValue();

    const program = makeProgram();
    await program.parseAsync(['restore', 'work', '--browser', 'firefox'], { from: 'user' });

    expect(validateBrowser).toHaveBeenCalledWith('firefox');
    expect(restoreSession).toHaveBeenCalledWith(
      { name: 'work', urls: ['https://a.com'] },
      'firefox'
    );
  });

  test('exits with error for invalid browser', async () => {
    validateBrowser.mockReturnValue('unsupported browser: badbrowser');
    const program = makeProgram();
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(program.parseAsync(['restore', 'work', '--browser', 'badbrowser'], { from: 'user' }))
      .rejects.toThrow();

    expect(restoreSession).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });

  test('exits with error when session not found', async () => {
    validateBrowser.mockReturnValue(null);
    getSession.mockReturnValue(null);
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    const program = makeProgram();
    await expect(program.parseAsync(['restore', 'missing'], { from: 'user' }))
      .rejects.toThrow();

    expect(restoreSession).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });
});
