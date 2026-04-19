const { Command } = require('commander');
const { getRecentSessions, registerRecentCommand } = require('./cli-recent-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerRecentCommand(program);
  return program;
}

const mockSessions = {
  alpha: { urls: ['https://a.com'], savedAt: '2024-01-03T10:00:00Z' },
  beta:  { urls: ['https://b.com', 'https://c.com'], savedAt: '2024-01-01T10:00:00Z' },
  gamma: { urls: [], savedAt: '2024-01-02T10:00:00Z' },
};

describe('getRecentSessions', () => {
  test('returns sessions sorted by savedAt descending', () => {
    const result = getRecentSessions(mockSessions, 3);
    expect(result[0].name).toBe('alpha');
    expect(result[1].name).toBe('gamma');
    expect(result[2].name).toBe('beta');
  });

  test('respects limit', () => {
    const result = getRecentSessions(mockSessions, 2);
    expect(result).toHaveLength(2);
  });

  test('excludes sessions without savedAt', () => {
    const sessions = { ...mockSessions, nosave: { urls: [] } };
    const result = getRecentSessions(sessions, 10);
    expect(result.find(s => s.name === 'nosave')).toBeUndefined();
  });
});

describe('recent command', () => {
  beforeEach(() => {
    storage.readSessions.mockResolvedValue(mockSessions);
  });

  test('prints recent sessions', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'recent']);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('outputs json when --json flag passed', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'recent', '--json']);
    const output = spy.mock.calls[0][0];
    expect(() => JSON.parse(output)).not.toThrow();
    spy.mockRestore();
  });

  test('shows message when no sessions', async () => {
    storage.readSessions.mockResolvedValue({});
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'recent']);
    expect(spy).toHaveBeenCalledWith('No sessions found.');
    spy.mockRestore();
  });
});
