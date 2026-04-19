const { Command } = require('commander');
const { duplicateSession, registerDuplicateCommand } = require('./cli-duplicate-handler');

const baseSessions = [
  { name: 'work', urls: ['https://github.com', 'https://jira.com'], createdAt: '2024-01-01T00:00:00.000Z', tags: ['dev'] },
  { name: 'personal', urls: ['https://gmail.com'], createdAt: '2024-01-02T00:00:00.000Z' },
];

function makeProgram(readSessions, writeSessions) {
  const program = new Command();
  program.exitOverride();
  registerDuplicateCommand(program, { readSessions, writeSessions });
  return program;
}

describe('duplicateSession', () => {
  test('duplicates a session with a new name', () => {
    const result = duplicateSession(baseSessions, 'work', 'work-copy');
    const copy = result.find(s => s.name === 'work-copy');
    expect(copy).toBeDefined();
    expect(copy.urls).toEqual(['https://github.com', 'https://jira.com']);
    expect(copy.tags).toEqual(['dev']);
  });

  test('preserves original session', () => {
    const result = duplicateSession(baseSessions, 'work', 'work-copy');
    expect(result.find(s => s.name === 'work')).toBeDefined();
  });

  test('throws if source not found', () => {
    expect(() => duplicateSession(baseSessions, 'nope', 'copy')).toThrow('not found');
  });

  test('throws if new name already exists', () => {
    expect(() => duplicateSession(baseSessions, 'work', 'personal')).toThrow('already exists');
  });

  test('does not copy favorite or note fields', () => {
    const sessions = [{ name: 'fav', urls: [], createdAt: '', favorite: true, note: 'hello' }];
    const result = duplicateSession(sessions, 'fav', 'fav-copy');
    const copy = result.find(s => s.name === 'fav-copy');
    expect(copy.favorite).toBeUndefined();
    expect(copy.note).toBeUndefined();
  });
});

describe('registerDuplicateCommand', () => {
  test('calls writeSessions on success', async () => {
    const read = jest.fn(() => [...baseSessions]);
    const write = jest.fn();
    const program = makeProgram(read, write);
    await program.parseAsync(['duplicate', 'work', 'work-copy'], { from: 'user' });
    expect(write).toHaveBeenCalledTimes(1);
  });

  test('exits with error for missing source', async () => {
    const read = jest.fn(() => [...baseSessions]);
    const write = jest.fn();
    const program = makeProgram(read, write);
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(program.parseAsync(['duplicate', 'missing', 'copy'], { from: 'user' })).rejects.toThrow();
    exit.mockRestore();
  });
});
