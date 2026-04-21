const { Command } = require('commander');
const { registerVersionCommand } = require('./cli-version-handler');
jest.mock('./storage');
const storage = require('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerVersionCommand(program);
  return program;
}

describe('version command', () => {
  beforeEach(() => {
    storage.readSessions.mockReturnValue({
      alpha: { urls: ['https://x.com'] },
      beta: { urls: ['https://y.com', 'https://z.com'] },
    });
  });

  it('prints short version by default', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['version'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringMatching(/tabstack v\d+\.\d+\.\d+/));
    spy.mockRestore();
  });

  it('prints verbose info with --verbose flag', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['version', '--verbose'], { from: 'user' });
    const output = spy.mock.calls[0][0];
    expect(output).toContain('Sessions stored:');
    expect(output).toContain('Total URLs tracked:');
    spy.mockRestore();
  });

  it('shows 0 sessions when storage is empty', () => {
    storage.readSessions.mockReturnValue({});
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['version', '-v'], { from: 'user' });
    const output = spy.mock.calls[0][0];
    expect(output).toContain('Sessions stored: 0');
    spy.mockRestore();
  });
});
