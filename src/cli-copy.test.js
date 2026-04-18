const { Command } = require('commander');
const { registerCopyCommand } = require('./cli-copy');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerCopyCommand(program);
  return program;
}

describe('copy command', () => {
  beforeEach(() => jest.clearAllMocks());

  test('copies session to new name', async () => {
    const urls = ['https://example.com', 'https://github.com'];
    storage.getSession
      .mockResolvedValueOnce({ urls })
      .mockResolvedValueOnce(null);
    storage.saveSession.mockResolvedValue();

    const spy = jest.spyOn(console, 'log').mockImplementation();
    await makeProgram().parseAsync(['copy', 'work', 'work-backup'], { from: 'user' });

    expect(storage.saveSession).toHaveBeenCalledWith('work-backup', urls);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Copied session'));
    spy.mockRestore();
  });

  test('errors if source session not found', async () => {
    storage.getSession.mockResolvedValueOnce(null);
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(
      makeProgram().parseAsync(['copy', 'nope', 'dest'], { from: 'user' })
    ).rejects.toThrow('exit');

    expect(spy).toHaveBeenCalledWith(expect.stringContaining("'nope' not found"));
    spy.mockRestore();
    exitSpy.mockRestore();
  });

  test('errors if destination already exists', async () => {
    storage.getSession
      .mockResolvedValueOnce({ urls: ['https://a.com'] })
      .mockResolvedValueOnce({ urls: ['https://b.com'] });
    const spy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(
      makeProgram().parseAsync(['copy', 'src', 'existing'], { from: 'user' })
    ).rejects.toThrow('exit');

    expect(spy).toHaveBeenCalledWith(expect.stringContaining("already exists"));
    spy.mockRestore();
    exitSpy.mockRestore();
  });
});
