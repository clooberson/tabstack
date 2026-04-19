const { addToHistory, getHistory, clearHistory } = require('./cli-history-handler');

function makeSession(urls = []) {
  return { urls, history: [] };
}

describe('addToHistory', () => {
  it('adds a url entry with timestamp', () => {
    const session = makeSession();
    const updated = addToHistory(session, 'https://example.com');
    expect(updated.history).toHaveLength(1);
    expect(updated.history[0].url).toBe('https://example.com');
    expect(updated.history[0].addedAt).toBeDefined();
  });

  it('appends multiple entries', () => {
    let session = makeSession();
    session = addToHistory(session, 'https://a.com');
    session = addToHistory(session, 'https://b.com');
    expect(session.history).toHaveLength(2);
  });

  it('initializes history if missing', () => {
    const session = { urls: [] };
    const updated = addToHistory(session, 'https://x.com');
    expect(updated.history).toHaveLength(1);
  });
});

describe('getHistory', () => {
  it('returns history array', () => {
    const session = { history: [{ url: 'https://a.com', addedAt: '2024-01-01' }] };
    expect(getHistory(session)).toHaveLength(1);
  });

  it('returns empty array if no history', () => {
    expect(getHistory({})).toEqual([]);
  });
});

describe('clearHistory', () => {
  it('clears history', () => {
    const session = { history: [{ url: 'https://a.com', addedAt: '2024-01-01' }] };
    const updated = clearHistory(session);
    expect(updated.history).toEqual([]);
  });
});
