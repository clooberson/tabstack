const { Command } = require('commander');
const { registerPriorityCommand } = require('./cli-priority-handler');
const { readSessions, writeSessions } = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerPriorityCommand(program);
  return program;
}

const baseSessions = {
  alpha: { urls: ['https://alpha.com'], priority: 'high' },
  beta: { urls: ['https://beta.com'] },
};

beforeEach(() => {
  jest.clearAllMocks();
  readSessions.mockResolvedValue(JSON.parse(JSON.stringify(baseSessions)));
  writeSessions.mockResolvedValue();
});

describe('priority set command', () => {
  test('sets priority and writes sessions', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'priority', 'set', 'beta', 'medium']);
    expect(writeSessions).toHaveBeenCalledWith(
      expect.objectContaining({
        beta: expect.objectContaining({ priority: 'medium' }),
      })
    );
  });

  test('prints confirmation message', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'priority', 'set', 'beta', 'low']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('low'));
    spy.mockRestore();
  });
});

describe('priority clear command', () => {
  test('clears priority and writes sessions', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'priority', 'clear', 'alpha']);
    const written = writeSessions.mock.calls[0][0];
    expect(written.alpha.priority).toBeUndefined();
  });
});

describe('priority list command', () => {
  test('lists sessions with priorities', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'priority', 'list']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('alpha'));
    spy.mockRestore();
  });

  test('shows message when no prioritized sessions found', async () => {
    readSessions.mockResolvedValue({ misc: { urls: ['https://x.com'] } });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'priority', 'list']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No sessions'));
    spy.mockRestore();
  });

  test('filters list by priority level', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'priority', 'list', 'high']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('HIGH'));
    spy.mockRestore();
  });
});
