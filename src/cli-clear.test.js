const { Command } = require('commander');
const { clearAllSessions } = require('./cli-clear-handler');
const { readSessions, writeSessions } = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const { registerClearCommand } = require('./cli-clear-handler');
  const program = new Command();
  program.exitOverride();
  registerClearCommand(program);
  return program;
}

const mockSessions = {
  work: { urls: ['https://github.com'], archived: false, favorite: true },
  old: { urls: ['https://example.com'], archived: true, favorite: false },
};

beforeEach(() => {
  jest.resetAllMocks();
  readSessions.mockResolvedValue({ ...mockSessions });
  writeSessions.mockResolvedValue();
});

test('clears all sessions', async () => {
  const result = await clearAllSessions({});
  expect(writeSessions).toHaveBeenCalledWith({});
  expect(result.cleared).toBe(2);
});

test('clears only archived sessions', async () => {
  const result = await clearAllSessions({ filter: 'archived' });
  const written = writeSessions.mock.calls[0][0];
  expect(written).not.toHaveProperty('old');
  expect(written).toHaveProperty('work');
  expect(result.cleared).toBe(1);
});

test('clears only favorite sessions', async () => {
  const result = await clearAllSessions({ filter: 'favorites' });
  const written = writeSessions.mock.calls[0][0];
  expect(written).not.toHaveProperty('work');
  expect(written).toHaveProperty('old');
  expect(result.cleared).toBe(1);
});

test('returns message when no sessions exist', async () => {
  readSessions.mockResolvedValue({});
  const result = await clearAllSessions({});
  expect(writeSessions).not.toHaveBeenCalled();
  expect(result.cleared).toBe(0);
});
