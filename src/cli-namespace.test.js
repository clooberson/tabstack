const { Command } = require('commander');
const { registerNamespaceCommand } = require('./cli-namespace-handler');
const { readSessions, writeSessions } = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerNamespaceCommand(program);
  return program;
}

const baseSessions = () => ({
  alpha: { urls: ['https://a.com'], namespace: 'team' },
  beta: { urls: ['https://b.com'] },
});

beforeEach(() => jest.clearAllMocks());

test('namespace set updates session and writes', async () => {
  readSessions.mockResolvedValue(baseSessions());
  writeSessions.mockResolvedValue();
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'namespace', 'set', 'beta', 'team']);
  expect(writeSessions).toHaveBeenCalledWith(expect.objectContaining({
    beta: expect.objectContaining({ namespace: 'team' }),
  }));
});

test('namespace remove updates session and writes', async () => {
  readSessions.mockResolvedValue(baseSessions());
  writeSessions.mockResolvedValue();
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'namespace', 'remove', 'alpha']);
  expect(writeSessions).toHaveBeenCalled();
  const written = writeSessions.mock.calls[0][0];
  expect(written.alpha.namespace).toBeUndefined();
});

test('namespace list prints sessions in namespace', async () => {
  readSessions.mockResolvedValue(baseSessions());
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'namespace', 'list', 'team']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('alpha'));
  spy.mockRestore();
});

test('namespace all prints all namespaces', async () => {
  readSessions.mockResolvedValue(baseSessions());
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'namespace', 'all']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('team'));
  spy.mockRestore();
});

test('namespace list with no match prints empty message', async () => {
  readSessions.mockResolvedValue(baseSessions());
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'namespace', 'list', 'nonexistent']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('No sessions'));
  spy.mockRestore();
});
