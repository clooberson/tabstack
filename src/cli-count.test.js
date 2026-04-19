const { Command } = require('commander');
const { countSessions, registerCountCommand } = require('./cli-count-handler');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerCountCommand(program);
  return program;
}

describe('countSessions', () => {
  const sessions = {
    work: { urls: ['http://a.com', 'http://b.com'], favorite: true, tags: ['work'] },
    home: { urls: ['http://c.com'], archived: true, tags: [] },
    misc: { urls: [], favorite: false },
  };

  it('counts total sessions', () => {
    expect(countSessions(sessions).total).toBe(3);
  });

  it('counts total urls', () => {
    expect(countSessions(sessions).totalUrls).toBe(3);
  });

  it('counts archived sessions', () => {
    expect(countSessions(sessions).archived).toBe(1);
  });

  it('counts favorites', () => {
    expect(countSessions(sessions).favorites).toBe(1);
  });

  it('counts tagged sessions', () => {
    expect(countSessions(sessions).tagged).toBe(1);
  });

  it('handles empty sessions', () => {
    const counts = countSessions({});
    expect(counts.total).toBe(0);
    expect(counts.totalUrls).toBe(0);
  });
});

describe('count command', () => {
  let storage;

  beforeEach(() => {
    storage = require('./storage');
    jest.spyOn(storage, 'readSessions').mockResolvedValue({
      alpha: { urls: ['http://x.com'], favorite: true, tags: ['t1'] },
      beta: { urls: ['http://y.com', 'http://z.com'], archived: true },
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('prints counts to stdout', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'count']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Sessions:'));
    spy.mockRestore();
  });

  it('outputs json with --json flag', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'count', '--json']);
    const output = spy.mock.calls[0][0];
    const parsed = JSON.parse(output);
    expect(parsed.total).toBe(2);
    spy.mockRestore();
  });
});
