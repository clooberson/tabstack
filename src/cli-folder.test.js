const { Command } = require('commander');
const { registerFolderCommand } = require('./cli-folder-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerFolderCommand(program);
  return program;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('folder set', () => {
  it('sets folder and writes sessions', async () => {
    const sessions = { work: { urls: [] } };
    storage.readSessions.mockResolvedValue(sessions);
    storage.writeSessions.mockResolvedValue();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['folder', 'set', 'work', 'projects'], { from: 'user' });
    expect(storage.writeSessions).toHaveBeenCalledWith(expect.objectContaining({
      work: expect.objectContaining({ folder: 'projects' })
    }));
    spy.mockRestore();
  });
});

describe('folder remove', () => {
  it('removes folder and writes sessions', async () => {
    const sessions = { work: { urls: [], folder: 'dev' } };
    storage.readSessions.mockResolvedValue(sessions);
    storage.writeSessions.mockResolvedValue();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['folder', 'remove', 'work'], { from: 'user' });
    expect(storage.writeSessions).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('folder get', () => {
  it('prints folder name', async () => {
    storage.readSessions.mockResolvedValue({ work: { urls: [], folder: 'dev' } });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['folder', 'get', 'work'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('Folder: dev');
    spy.mockRestore();
  });

  it('prints message when no folder', async () => {
    storage.readSessions.mockResolvedValue({ work: { urls: [] } });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['folder', 'get', 'work'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('Session "work" has no folder');
    spy.mockRestore();
  });
});

describe('folder list', () => {
  it('lists sessions in folder', async () => {
    storage.readSessions.mockResolvedValue({ work: { urls: [], folder: 'dev' }, misc: { urls: [] } });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['folder', 'list', 'dev'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('work');
    spy.mockRestore();
  });

  it('lists all folders when no arg given', async () => {
    storage.readSessions.mockResolvedValue({ work: { urls: [], folder: 'dev' }, personal: { urls: [], folder: 'leisure' } });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['folder', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('dev');
    expect(spy).toHaveBeenCalledWith('leisure');
    spy.mockRestore();
  });
});
