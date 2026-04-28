const { Command } = require('commander');
const { registerPinHandlerCommand } = require('./cli-pin-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram(sessions) {
  storage.readSessions.mockResolvedValue(sessions);
  storage.writeSessions.mockResolvedValue();
  const program = new Command();
  program.exitOverride();
  registerPinHandlerCommand(program);
  return program;
}

describe('pin add', () => {
  it('pins a session and writes updated sessions', async () => {
    const sessions = { docs: { urls: ['https://docs.example.com'], pinned: false } };
    const program = makeProgram(sessions);
    await program.parseAsync(['pin', 'add', 'docs'], { from: 'user' });
    expect(storage.writeSessions).toHaveBeenCalledWith(
      expect.objectContaining({ docs: expect.objectContaining({ pinned: true }) })
    );
  });
});

describe('pin remove', () => {
  it('unpins a session and writes updated sessions', async () => {
    const sessions = { docs: { urls: ['https://docs.example.com'], pinned: true } };
    const program = makeProgram(sessions);
    await program.parseAsync(['pin', 'remove', 'docs'], { from: 'user' });
    expect(storage.writeSessions).toHaveBeenCalledWith(
      expect.objectContaining({ docs: expect.objectContaining({ pinned: false }) })
    );
  });
});

describe('pin list', () => {
  it('prints pinned sessions', async () => {
    const sessions = {
      docs: { urls: ['https://docs.example.com'], pinned: true },
      other: { urls: ['https://other.com'], pinned: false },
    };
    const program = makeProgram(sessions);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['pin', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('docs'));
    spy.mockRestore();
  });
});
