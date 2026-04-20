const { Command } = require('commander');
const { registerRemindCommand } = require('./cli-remind-handler');

function makeProgram(sessions) {
  const { readSessions, writeSessions } = require('./storage');
  jest.mock('./storage');
  readSessions.mockResolvedValue(sessions);
  writeSessions.mockResolvedValue();
  const program = new Command();
  program.exitOverride();
  registerRemindCommand(program);
  return program;
}

describe('remind set', () => {
  beforeEach(() => jest.resetModules());

  it('sets a reminder on a session', async () => {
    jest.mock('./storage', () => ({
      readSessions: jest.fn().mockResolvedValue({ work: { urls: ['https://example.com'] } }),
      writeSessions: jest.fn().mockResolvedValue(),
    }));
    const { registerRemindCommand } = require('./cli-remind-handler');
    const program = new Command();
    program.exitOverride();
    registerRemindCommand(program);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['remind', 'set', 'work', '2099-01-01', 'Review tabs'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('work'));
    spy.mockRestore();
  });

  it('errors on missing session', async () => {
    jest.mock('./storage', () => ({
      readSessions: jest.fn().mockResolvedValue({}),
      writeSessions: jest.fn().mockResolvedValue(),
    }));
    const { registerRemindCommand } = require('./cli-remind-handler');
    const program = new Command();
    program.exitOverride();
    registerRemindCommand(program);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    await program.parseAsync(['remind', 'set', 'nope', '2099-01-01', 'msg'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    spy.mockRestore();
    exitSpy.mockRestore();
  });
});

describe('remind list', () => {
  beforeEach(() => jest.resetModules());

  it('lists reminders sorted by date', async () => {
    jest.mock('./storage', () => ({
      readSessions: jest.fn().mockResolvedValue({
        a: { urls: [], reminder: { message: 'first', date: '2099-06-01T00:00:00.000Z' } },
        b: { urls: [], reminder: { message: 'second', date: '2099-03-01T00:00:00.000Z' } },
      }),
      writeSessions: jest.fn().mockResolvedValue(),
    }));
    const { registerRemindCommand } = require('./cli-remind-handler');
    const program = new Command();
    program.exitOverride();
    registerRemindCommand(program);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['remind', 'list'], { from: 'user' });
    const calls = spy.mock.calls.map(c => c[0]);
    expect(calls[0]).toMatch(/b/);
    expect(calls[1]).toMatch(/a/);
    spy.mockRestore();
  });

  it('prints message when no reminders', async () => {
    jest.mock('./storage', () => ({
      readSessions: jest.fn().mockResolvedValue({ x: { urls: [] } }),
      writeSessions: jest.fn().mockResolvedValue(),
    }));
    const { registerRemindCommand } = require('./cli-remind-handler');
    const program = new Command();
    program.exitOverride();
    registerRemindCommand(program);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['remind', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No reminders set.');
    spy.mockRestore();
  });
});
