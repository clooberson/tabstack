const { Command } = require('commander');
const { registerRenameCommand } = require('./cli-rename');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerRenameCommand(program);
  return program;
}

describe('rename command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renames an existing session', async () => {
    storage.listSessions.mockReturnValue(['work']);
    storage.renameSession.mockImplementation(() => {});

    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'rename', 'work', 'office']);

    expect(storage.renameSession).toHaveBeenCalledWith('work', 'office');
  });

  test('exits if old session does not exist', async () => {
    storage.listSessions.mockReturnValue([]);
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    const program = makeProgram();
    await expect(
      program.parseAsync(['node', 'test', 'rename', 'ghost', 'new'])
    ).rejects.toThrow('exit');

    expect(storage.renameSession).not.toHaveBeenCalled();
    mockExit.mockRestore();
  });

  test('exits if new name already taken', async () => {
    storage.listSessions.mockReturnValue(['work', 'office']);
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    const program = makeProgram();
    await expect(
      program.parseAsync(['node', 'test', 'rename', 'work', 'office'])
    ).rejects.toThrow('exit');

    mockExit.mockRestore();
  });
});
