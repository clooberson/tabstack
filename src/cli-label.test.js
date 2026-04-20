const { Command } = require('commander');
const { registerLabelCommand } = require('./cli-label-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerLabelCommand(program);
  return program;
}

const baseSessions = {
  alpha: { urls: ['https://example.com'] },
  beta: { urls: ['https://beta.com'], label: 'OldLabel' },
};

beforeEach(() => {
  jest.clearAllMocks();
  storage.readSessions.mockResolvedValue(JSON.parse(JSON.stringify(baseSessions)));
  storage.writeSessions.mockResolvedValue();
});

describe('label set', () => {
  it('writes updated label to storage', async () => {
    const program = makeProgram();
    await program.parseAsync(['label', 'set', 'alpha', 'MyLabel'], { from: 'user' });
    expect(storage.writeSessions).toHaveBeenCalledWith(
      expect.objectContaining({
        alpha: expect.objectContaining({ label: 'MyLabel' }),
      })
    );
  });
});

describe('label remove', () => {
  it('removes label from session', async () => {
    const program = makeProgram();
    await program.parseAsync(['label', 'remove', 'beta'], { from: 'user' });
    const written = storage.writeSessions.mock.calls[0][0];
    expect(written.beta.label).toBeUndefined();
  });
});

describe('label get', () => {
  it('prints the label', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['label', 'get', 'beta'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('OldLabel');
    spy.mockRestore();
  });

  it('prints no label message when unset', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['label', 'get', 'alpha'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No label'));
    spy.mockRestore();
  });
});

describe('label list', () => {
  it('lists sessions with matching label', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['label', 'list', 'OldLabel'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('beta'));
    spy.mockRestore();
  });

  it('prints no sessions message when none match', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['label', 'list', 'Ghost'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No sessions'));
    spy.mockRestore();
  });
});
