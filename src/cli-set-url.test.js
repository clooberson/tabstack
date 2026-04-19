const { setUrl } = require('./cli-set-url-handler');

const makeSessions = () => ({
  work: { urls: ['https://github.com', 'https://jira.com', 'https://slack.com'], tags: [] }
});

function makeProgram() {
  const { Command } = require('commander');
  const { registerSetUrlCommand } = require('./cli-set-url-handler');
  const program = new Command();
  program.exitOverride();
  return program;
}

describe('setUrl', () => {
  test('replaces url at given index', () => {
    const sessions = makeSessions();
    const result = setUrl(sessions, 'work', 1, 'https://linear.app');
    expect(result.urls[1]).toBe('https://linear.app');
    expect(result.urls[0]).toBe('https://github.com');
    expect(result.urls[2]).toBe('https://slack.com');
  });

  test('throws if session not found', () => {
    expect(() => setUrl({}, 'nope', 0, 'https://x.com')).toThrow('not found');
  });

  test('throws if index out of range', () => {
    const sessions = makeSessions();
    expect(() => setUrl(sessions, 'work', 10, 'https://x.com')).toThrow('out of range');
  });

  test('throws if index is negative', () => {
    const sessions = makeSessions();
    expect(() => setUrl(sessions, 'work', -1, 'https://x.com')).toThrow('out of range');
  });

  test('throws on invalid url', () => {
    const sessions = makeSessions();
    expect(() => setUrl(sessions, 'work', 0, 'not-a-url')).toThrow('Invalid URL');
  });

  test('does not mutate original urls array', () => {
    const sessions = makeSessions();
    const original = [...sessions.work.urls];
    setUrl(sessions, 'work', 0, 'https://new.com');
    expect(sessions.work.urls).toEqual(original);
  });
});
