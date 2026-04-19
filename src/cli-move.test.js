const { Command } = require('commander');
const { moveSession, registerMoveCommand } = require('./cli-move-handler');
const storage = require('./storage');
const storageMutations = require('./storage-mutations');

jest.mock('./storage');
jest.mock('./storage-mutations');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerMoveCommand(program);
  return program;
}

describe('moveSession', () => {
  beforeEach(() => jest.clearAllMocks());

  it('moves a session to a new name', async () => {
    storage.getSession
      .mockResolvedValueOnce({ urls: ['https://a.com'], name: 'old' })
      .mockResolvedValueOnce(null);
    storage.saveSession.mockResolvedValue();
    storageMutations.deleteSession.mockResolvedValue();

    const result = await moveSession('old', 'new');
    expect(result).toEqual({ from: 'old', to: 'new', urlCount: 1 });
    expect(storage.saveSession).toHaveBeenCalledWith('new', expect.objectContaining({ name: 'new', movedFrom: 'old' }));
    expect(storageMutations.deleteSession).toHaveBeenCalledWith('old');
  });

  it('throws if source session not found', async () => {
    storage.getSession.mockResolvedValue(null);
    await expect(moveSession('ghost', 'new')).rejects.toThrow('not found');
  });

  it('throws if destination exists without force', async () => {
    storage.getSession
      .mockResolvedValueOnce({ urls: [], name: 'old' })
      .mockResolvedValueOnce({ urls: [], name: 'new' });
    await expect(moveSession('old', 'new')).rejects.toThrow('already exists');
  });

  it('overwrites destination with force option', async () => {
    storage.getSession
      .mockResolvedValueOnce({ urls: ['https://x.com'], name: 'old' })
      .mockResolvedValueOnce({ urls: [], name: 'new' });
    storage.saveSession.mockResolvedValue();
    storageMutations.deleteSession.mockResolvedValue();

    const result = await moveSession('old', 'new', { force: true });
    expect(result.to).toBe('new');
  });
});

describe('move command', () => {
  beforeEach(() => jest.clearAllMocks());

  it('prints success message', async () => {
    storage.getSession
      .mockResolvedValueOnce({ urls: ['https://a.com', 'https://b.com'], name: 'work' })
      .mockResolvedValueOnce(null);
    storage.saveSession.mockResolvedValue();
    storageMutations.deleteSession.mockResolvedValue();

    const spy = jest.spyOn(console, 'log').mockImplementation();
    await makeProgram().parseAsync(['node', 'test', 'move', 'work', 'work-backup']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('work → work-backup'));
    spy.mockRestore();
  });
});
