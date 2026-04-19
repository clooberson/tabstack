const { batchRestore, batchDelete } = require('./cli-batch-handler');
jest.mock('./restore');
jest.mock('./storage');

const { restoreSession } = require('./restore');
const { readSessions, writeSessions } = require('./storage');

describe('batchRestore', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns ok for each successful restore', async () => {
    restoreSession.mockResolvedValue();
    const results = await batchRestore(['work', 'home']);
    expect(results).toEqual([
      { name: 'work', status: 'ok' },
      { name: 'home', status: 'ok' },
    ]);
  });

  it('returns error when restore fails', async () => {
    restoreSession.mockRejectedValue(new Error('not found'));
    const results = await batchRestore(['missing']);
    expect(results[0].status).toBe('error');
    expect(results[0].message).toBe('not found');
  });

  it('handles mixed results', async () => {
    restoreSession
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error('fail'));
    const results = await batchRestore(['a', 'b']);
    expect(results[0].status).toBe('ok');
    expect(results[1].status).toBe('error');
  });
});

describe('batchDelete', () => {
  beforeEach(() => jest.clearAllMocks());

  it('deletes existing sessions', async () => {
    readSessions.mockResolvedValue({ work: { urls: [] }, home: { urls: [] } });
    writeSessions.mockResolvedValue();
    const results = await batchDelete(['work']);
    expect(results).toEqual([{ name: 'work', status: 'ok' }]);
    expect(writeSessions).toHaveBeenCalledWith({ home: { urls: [] } });
  });

  it('returns error for missing session', async () => {
    readSessions.mockResolvedValue({});
    writeSessions.mockResolvedValue();
    const results = await batchDelete(['nope']);
    expect(results[0].status).toBe('error');
  });
});
