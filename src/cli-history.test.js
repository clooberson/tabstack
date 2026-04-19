const { Command } = require('commander');
const { registerHistoryCommand, recordHistory, getHistory, clearHistory } = require('./cli-history-handler');
const { readSessions, writeSessions } = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerHistoryCommand(program);
  return program;
}

beforeEach(() => {
  readSessions.mockReturnValue({});
  writeSessions.mockImplementation(() => {});
});

test('recordHistory adds entry', () => {
  readSessions.mockReturnValue({ _history: [] });
  recordHistory('work', 'save');
  const written = writeSessions.mock.calls[0][0];
  expect(written._history[0].sessionName).toBe('work');
  expect(written._history[0].action).toBe('save');
});

test('getHistory returns entries up to limit', () => {
  readSessions.mockReturnValue({
    _history: [
      { sessionName: 'a', action: 'save', timestamp: '2024-01-01T00:00:00.000Z' },
      { sessionName: 'b', action: 'restore', timestamp: '2024-01-02T00:00:00.000Z' },
    ],
  });
  const result = getHistory(1);
  expect(result).toHaveLength(1);
  expect(result[0].sessionName).toBe('a');
});

test('clearHistory empties history', () => {
  readSessions.mockReturnValue({ _history: [{ sessionName: 'x', action: 'save', timestamp: '' }] });
  clearHistory();
  const written = writeSessions.mock.calls[0][0];
  expect(written._history).toHaveLength(0);
});

test('history command prints entries', () => {
  readSessions.mockReturnValue({
    _history: [{ sessionName: 'work', action: 'save', timestamp: '2024-01-01T00:00:00.000Z' }],
  });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['node', 'test', 'history']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('work'));
  spy.mockRestore();
});

test('history --clear clears and confirms', () => {
  readSessions.mockReturnValue({ _history: [] });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['node', 'test', 'history', '--clear']);
  expect(spy).toHaveBeenCalledWith('History cleared.');
  spy.mockRestore();
});

test('history shows no history message when empty', () => {
  readSessions.mockReturnValue({ _history: [] });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  program.parse(['node', 'test', 'history']);
  expect(spy).toHaveBeenCalledWith('No history found.');
  spy.mockRestore();
});
