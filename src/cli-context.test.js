const { Command } = require('commander');
const { setContext, removeContext, getContext, listByContext, registerContextCommand } = require('./cli-context-handler');

const makeSessions = () => ({
  work: { urls: ['https://github.com', 'https://jira.com'], context: 'development' },
  personal: { urls: ['https://reddit.com'], context: 'leisure' },
  misc: { urls: ['https://example.com'] },
});

function makeProgram(sessions) {
  const { readSessions, writeSessions } = require('./storage');
  jest.mock('./storage');
  readSessions.mockResolvedValue(sessions);
  writeSessions.mockResolvedValue();
  const program = new Command();
  program.exitOverride();
  registerContextCommand(program);
  return program;
}

describe('setContext', () => {
  test('sets context on existing session', () => {
    const sessions = makeSessions();
    const result = setContext(sessions, 'misc', 'testing');
    expect(result.misc.context).toBe('testing');
  });

  test('throws if session not found', () => {
    expect(() => setContext(makeSessions(), 'nope', 'ctx')).toThrow('Session "nope" not found');
  });
});

describe('removeContext', () => {
  test('removes context from session', () => {
    const sessions = makeSessions();
    const result = removeContext(sessions, 'work');
    expect(result.work.context).toBeUndefined();
  });

  test('throws if session not found', () => {
    expect(() => removeContext(makeSessions(), 'ghost')).toThrow('Session "ghost" not found');
  });
});

describe('getContext', () => {
  test('returns context for session', () => {
    const sessions = makeSessions();
    expect(getContext(sessions, 'work')).toBe('development');
  });

  test('returns null if no context set', () => {
    const sessions = makeSessions();
    expect(getContext(sessions, 'misc')).toBeNull();
  });

  test('throws if session not found', () => {
    expect(() => getContext(makeSessions(), 'nope')).toThrow('Session "nope" not found');
  });
});

describe('listByContext', () => {
  test('returns sessions matching context', () => {
    const sessions = makeSessions();
    const results = listByContext(sessions, 'development');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('work');
  });

  test('returns empty array if no matches', () => {
    const results = listByContext(makeSessions(), 'unknown');
    expect(results).toHaveLength(0);
  });
});
