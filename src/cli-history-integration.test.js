const { recordHistory, getHistory, clearHistory } = require('./cli-history-handler');
const { readSessions, writeSessions } = require('./storage');

jest.mock('./storage');

beforeEach(() => {
  jest.clearAllMocks();
});

test('recordHistory trims to MAX_HISTORY entries', () => {
  const existing = Array.from({ length: 50 }, (_, i) => ({
    sessionName: `s${i}`,
    action: 'save',
    timestamp: new Date().toISOString(),
  }));
  readSessions.mockReturnValue({ _history: existing });
  recordHistory('new-session', 'save');
  const written = writeSessions.mock.calls[0][0];
  expect(written._history).toHaveLength(50);
  expect(written._history[0].sessionName).toBe('new-session');
});

test('recordHistory stores extra meta fields', () => {
  readSessions.mockReturnValue({ _history: [] });
  recordHistory('proj', 'restore', { browser: 'chrome' });
  const written = writeSessions.mock.calls[0][0];
  expect(written._history[0].browser).toBe('chrome');
});

test('getHistory returns empty array when no history key', () => {
  readSessions.mockReturnValue({});
  expect(getHistory()).toEqual([]);
});

test('clearHistory works when no history key exists', () => {
  readSessions.mockReturnValue({});
  expect(() => clearHistory()).not.toThrow();
  const written = writeSessions.mock.calls[0][0];
  expect(written._history).toEqual([]);
});
