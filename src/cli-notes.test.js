const { Command } = require('commander');
const { setNote, getNote, clearNote, registerNotesCommand } = require('./cli-notes-handler');
const { readSessions, writeSessions } = require('./storage');

jest.mock('./storage');

const mockSessions = () => ({
  work: { urls: ['https://example.com'], createdAt: '2024-01-01' },
});

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerNotesCommand(program);
  return program;
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('setNote adds note to session', () => {
  const sessions = mockSessions();
  readSessions.mockReturnValue(sessions);
  setNote('work', 'my note');
  expect(writeSessions).toHaveBeenCalledWith(expect.objectContaining({
    work: expect.objectContaining({ note: 'my note' }),
  }));
});

test('setNote throws for missing session', () => {
  readSessions.mockReturnValue({});
  expect(() => setNote('missing', 'hi')).toThrow('not found');
});

test('getNote returns note', () => {
  readSessions.mockReturnValue({ work: { urls: [], note: 'hello' } });
  expect(getNote('work')).toBe('hello');
});

test('getNote returns null when no note', () => {
  readSessions.mockReturnValue({ work: { urls: [] } });
  expect(getNote('work')).toBeNull();
});

test('clearNote removes note', () => {
  const sessions = { work: { urls: [], note: 'bye' } };
  readSessions.mockReturnValue(sessions);
  clearNote('work');
  expect(writeSessions).toHaveBeenCalledWith(expect.objectContaining({
    work: expect.not.objectContaining({ note: expect.anything() }),
  }));
});

test('notes set command logs success', async () => {
  const sessions = mockSessions();
  readSessions.mockReturnValue(sessions);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'notes', 'set', 'work', 'my note']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Note set'));
  spy.mockRestore();
});

test('notes get command prints note', async () => {
  readSessions.mockReturnValue({ work: { urls: [], note: 'hello world' } });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'notes', 'get', 'work']);
  expect(spy).toHaveBeenCalledWith('hello world');
  spy.mockRestore();
});
