const { Command } = require('commander');
const { registerAccessCommand } = require('./cli-access-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerAccessCommand(program);
  return program;
}

const baseSessions = {
  alpha: { urls: ['https://example.com'], accessLevel: 'private' },
  beta: { urls: ['https://test.com'] },
};

beforeEach(() => {
  jest.clearAllMocks();
  storage.readSessions.mockResolvedValue({ ...baseSessions });
  storage.writeSessions.mockResolvedValue();
});

describe('access set', () => {
  test('sets access level and writes sessions', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'access', 'set', 'beta', 'restricted']);
    expect(storage.writeSessions).toHaveBeenCalledWith(
      expect.objectContaining({ beta: expect.objectContaining({ accessLevel: 'restricted' }) })
    );
  });

  test('exits on invalid level', async () => {
    const program = makeProgram();
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(program.parseAsync(['node', 'test', 'access', 'set', 'alpha', 'top-secret'])).rejects.toThrow();
    mockExit.mockRestore();
  });
});

describe('access get', () => {
  test('prints access level of session', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'access', 'get', 'alpha']);
    expect(spy).toHaveBeenCalledWith('alpha: private');
    spy.mockRestore();
  });
});

describe('access list', () => {
  test('lists sessions by access level', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'access', 'list', 'public']);
    expect(spy).toHaveBeenCalledWith('beta');
    spy.mockRestore();
  });

  test('prints message if none found', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'access', 'list', 'restricted']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No sessions'));
    spy.mockRestore();
  });
});
