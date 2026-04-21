const { Command } = require('commander');
const { registerExpireCommand } = require('./cli-expire-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerExpireCommand(program);
  return program;
}

describe('expire set command', () => {
  it('sets expiry and logs confirmation', async () => {
    const sessions = { work: { urls: ['https://example.com'] } };
    storage.readSessions.mockResolvedValue(sessions);
    storage.writeSessions.mockResolvedValue();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await makeProgram().parseAsync(['expire', 'set', 'work', '2099-06-01'], { from: 'user' });

    expect(storage.writeSessions).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Expiry set for "work"'));
    spy.mockRestore();
  });
});

describe('expire clear command', () => {
  it('clears expiry and logs confirmation', async () => {
    const sessions = { work: { urls: [], expiresAt: Date.now() + 5000 } };
    storage.readSessions.mockResolvedValue(sessions);
    storage.writeSessions.mockResolvedValue();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await makeProgram().parseAsync(['expire', 'clear', 'work'], { from: 'user' });

    expect(storage.writeSessions).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('Expiry cleared for "work"');
    spy.mockRestore();
  });
});

describe('expire list command', () => {
  it('prints expired sessions', async () => {
    const sessions = {
      old: { urls: [], expiresAt: Date.now() - 1000 },
      new: { urls: [], expiresAt: Date.now() + 9999 },
    };
    storage.readSessions.mockResolvedValue(sessions);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await makeProgram().parseAsync(['expire', 'list'], { from: 'user' });

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('old'));
    spy.mockRestore();
  });

  it('prints message when no sessions are expired', async () => {
    storage.readSessions.mockResolvedValue({});
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await makeProgram().parseAsync(['expire', 'list'], { from: 'user' });

    expect(spy).toHaveBeenCalledWith('No expired sessions.');
    spy.mockRestore();
  });
});
