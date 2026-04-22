const { Command } = require('commander');
const { registerScopeCommand } = require('./cli-scope-handler');

jest.mock('./storage', () => ({
  readSessions: jest.fn(),
  writeSessions: jest.fn()
}));

const { readSessions, writeSessions } = require('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerScopeCommand(program);
  return program;
}

beforeEach(() => {
  jest.clearAllMocks();
  writeSessions.mockResolvedValue();
});

test('scope set updates session and writes', async () => {
  readSessions.mockResolvedValue({
    mysession: { urls: ['https://example.com'] }
  });
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'scope', 'set', 'mysession', 'work']);
  expect(writeSessions).toHaveBeenCalledWith(
    expect.objectContaining({
      mysession: expect.objectContaining({ scope: 'work' })
    })
  );
});

test('scope remove deletes scope and writes', async () => {
  readSessions.mockResolvedValue({
    mysession: { urls: ['https://example.com'], scope: 'work' }
  });
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'scope', 'remove', 'mysession']);
  expect(writeSessions).toHaveBeenCalled();
  const written = writeSessions.mock.calls[0][0];
  expect(written.mysession.scope).toBeUndefined();
});

test('scope get prints scope value', async () => {
  readSessions.mockResolvedValue({
    mysession: { urls: [], scope: 'personal' }
  });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'scope', 'get', 'mysession']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('personal'));
  spy.mockRestore();
});

test('scope list prints matching sessions', async () => {
  readSessions.mockResolvedValue({
    a: { urls: ['https://a.com'], scope: 'work' },
    b: { urls: ['https://b.com'], scope: 'personal' }
  });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'scope', 'list', 'work']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('a'));
  spy.mockRestore();
});
