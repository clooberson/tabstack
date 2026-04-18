const { Command } = require('commander');
const { registerDeleteCommand } = require('./cli-delete');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerDeleteCommand(program);
  return program;
}

describe('delete command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deletes an existing session with --force', async () => {
    storage.listSessions.mockReturnValue(['work', 'personal']);
    storage.deleteSession.mockImplementation(() => {});

    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'delete', 'work', '--force']);

    expect(storage.deleteSession).toHaveBeenCalledWith('work');
  });

  test('exits with error if session not found', async () => {
    storage.listSessions.mockReturnValue(['personal']);

    const program = makeProgram();
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(
      program.parseAsync(['node', 'test', 'delete', 'missing', '--force'])
    ).rejects.toThrow('exit');

    expect(storage.deleteSession).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });

  test('does not delete session without --force flag', async () => {
    storage.listSessions.mockReturnValue(['work', 'personal']);
    storage.deleteSession.mockImplementation(() => {});

    const program = makeProgram();
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(
      program.parseAsync(['node', 'test', 'delete', 'work'])
    ).rejects.toThrow('exit');

    expect(storage.deleteSession).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });
});
