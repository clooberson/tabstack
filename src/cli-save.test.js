const { registerSaveCommand } = require('./cli-save');
const storage = require('./storage');
const { Command } = require('commander');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride(); // prevent process.exit in tests
  registerSaveCommand(program);
  return program;
}

describe('registerSaveCommand', () => {
  beforeEach(() => jest.clearAllMocks());

  test('saves a session with valid URLs', () => {
    storage.saveSession.mockReturnValue({ name: 'work', urls: ['https://example.com'] });
    const program = makeProgram();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    program.parse(['save', 'work', 'https://example.com'], { from: 'user' });

    expect(storage.saveSession).toHaveBeenCalledWith('work', ['https://example.com'], undefined);
    expect(consoleSpy).toHaveBeenCalledWith('Session "work" saved with 1 tab(s).');
    consoleSpy.mockRestore();
  });

  test('passes --force flag to saveSession', () => {
    storage.saveSession.mockReturnValue({ name: 'work', urls: ['https://a.com', 'https://b.com'] });
    const program = makeProgram();
    jest.spyOn(console, 'log').mockImplementation(() => {});

    program.parse(['save', 'work', 'https://a.com', 'https://b.com', '--force'], { from: 'user' });

    expect(storage.saveSession).toHaveBeenCalledWith('work', ['https://a.com', 'https://b.com'], true);
  });

  test('exits on invalid URL', () => {
    const program = makeProgram();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    expect(() =>
      program.parse(['save', 'work', 'not-a-url'], { from: 'user' })
    ).toThrow('exit');

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('invalid URL'));
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
