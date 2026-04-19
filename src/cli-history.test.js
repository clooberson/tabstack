const { makeSession } = require('./cli-history.test-helpers') // will define inline
const { addToHistory, getHistory, clearHistory } = require('./cli-history-handler');

jest.mock('./storage');
const { readSessions, writeSessions } = require('./storage');

function makeSession(overrides = {}) {
  return { _history: [], ...overrides };
}

beforeEach(() => jest.clearAllMocks());

test('addToHistory adds entry to front', async () => {
  const data = makeSession();
  readSessions.mockResolvedValue(data);
  writeSessions.mockResolvedValue();
  await addToHistory('work');
  expect(writeSessions).toHaveBeenCalledWith(expect.objectContaining({
    _history: expect.arrayContaining([expect.objectContaining({ name: 'work' })])
  }));
  const written = writeSessions.mock.calls[0][0];
  expect(written._history[0].name).toBe('work');
});

test('addToHistory deduplicates entries', async () => {
  const data = makeSession({ _history: [{ name: 'work', accessedAt: '2024-01-01T00:00:00.000Z' }] });
  readSessions.mockResolvedValue(data);
  writeSessions.mockResolvedValue();
  await addToHistory('work');
  const written = writeSessions.mock.calls[0][0];
  expect(written._history.filter(e => e.name === 'work').length).toBe(1);
});

test('getHistory returns limited entries', async () => {
  const history = Array.from({ length: 20 }, (_, i) => ({ name: `s${i}`, accessedAt: new Date().toISOString() }));
  readSessions.mockResolvedValue({ _history: history });
  const result = await getHistory(5);
  expect(result.length).toBe(5);
});

test('clearHistory empties history', async () => {
  const data = makeSession({ _history: [{ name: 'a', accessedAt: '' }] });
  readSessions.mockResolvedValue(data);
  writeSessions.mockResolvedValue();
  await clearHistory();
  const written = writeSessions.mock.calls[0][0];
  expect(written._history).toEqual([]);
});

test('getHistory returns empty array when no history', async () => {
  readSessions.mockResolvedValue({});
  const result = await getHistory();
  expect(result).toEqual([]);
});
