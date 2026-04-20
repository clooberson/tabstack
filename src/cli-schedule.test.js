const { Command } = require('commander');
const { scheduleRestore, listScheduled, clearScheduled, registerScheduleCommand } = require('./cli-schedule-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerScheduleCommand(program);
  return program;
}

const baseSessions = {
  work: { urls: ['https://github.com'], tags: [] },
};

beforeEach(() => {
  storage.readSessions.mockReturnValue(JSON.parse(JSON.stringify(baseSessions)));
  storage.writeSessions.mockImplementation(() => {});
});

test('scheduleRestore adds entry to session', () => {
  const sessions = JSON.parse(JSON.stringify(baseSessions));
  storage.readSessions.mockReturnValue(sessions);
  storage.writeSessions.mockImplementation((s) => { Object.assign(sessions, s); });

  const result = scheduleRestore('work', '09:00', 'firefox');
  expect(result).toEqual({ sessionName: 'work', time: '09:00', browser: 'firefox' });
  expect(storage.writeSessions).toHaveBeenCalled();
});

test('scheduleRestore throws if session not found', () => {
  expect(() => scheduleRestore('nope', '10:00')).toThrow('Session "nope" not found');
});

test('listScheduled returns all scheduled entries', () => {
  storage.readSessions.mockReturnValue({
    work: { urls: [], scheduled: [{ time: '09:00', browser: null, createdAt: '2024-01-01' }] },
    home: { urls: [], scheduled: [{ time: '18:00', browser: 'chrome', createdAt: '2024-01-01' }] },
  });
  const results = listScheduled();
  expect(results).toHaveLength(2);
  expect(results[0].sessionName).toBe('work');
  expect(results[1].sessionName).toBe('home');
});

test('clearScheduled empties scheduled array', () => {
  const sessions = { work: { urls: [], scheduled: [{ time: '09:00' }] } };
  storage.readSessions.mockReturnValue(sessions);
  storage.writeSessions.mockImplementation((s) => { Object.assign(sessions, s); });
  clearScheduled('work');
  expect(storage.writeSessions).toHaveBeenCalledWith(expect.objectContaining({
    work: expect.objectContaining({ scheduled: [] }),
  }));
});

test('cli schedule add prints confirmation', async () => {
  const sessions = JSON.parse(JSON.stringify(baseSessions));
  storage.readSessions.mockReturnValue(sessions);
  storage.writeSessions.mockImplementation(() => {});
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'schedule', 'add', 'work', '08:30']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('08:30'));
  spy.mockRestore();
});

test('cli schedule list prints no scheduled when empty', async () => {
  storage.readSessions.mockReturnValue({ work: { urls: [] } });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'schedule', 'list']);
  expect(spy).toHaveBeenCalledWith('No scheduled restores.');
  spy.mockRestore();
});
