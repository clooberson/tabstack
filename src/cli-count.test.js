const { Command } = require('commander');
const { countSessions, registerCountCommand } = require('./cli-count-handler');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerCountCommand(program);
  return program;
}

const mockSessions = {
  work: { urls: ['https://a.com', 'https://b.com'], tags: ['work'], pinned: true, archived: false, favorite: false },
  personal: { urls: ['https://c.com'], tags: [], pinned: false, archived: true, favorite: true },
  misc: { urls: [], tags: ['misc', 'old'], pinned: false, archived: false, favorite: false },
};

describe('countSessions', () => {
  it('counts total sessions', () => {
    const result = countSessions(mockSessions);
    expect(result.total).toBe(3);
  });

  it('counts total URLs', () => {
    const result = countSessions(mockSessions);
    expect(result.totalUrls).toBe(3);
  });

  it('counts tagged sessions', () => {
    const result = countSessions(mockSessions);
    expect(result.tagged).toBe(2);
  });

  it('counts pinned sessions', () => {
    const result = countSessions(mockSessions);
    expect(result.pinned).toBe(1);
  });

  it('counts archived sessions', () => {
    const result = countSessions(mockSessions);
    expect(result.archived).toBe(1);
  });

  it('counts favorites', () => {
    const result = countSessions(mockSessions);
    expect(result.favorites).toBe(1);
  });

  it('handles empty sessions', () => {
    const result = countSessions({});
    expect(result).toEqual({ total: 0, totalUrls: 0, tagged: 0, pinned: 0, archived: 0, favorites: 0 });
  });
});

describe('count command', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.mock('./storage', () => ({ readSessions: jest.fn().mockResolvedValue(mockSessions) }));
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.resetModules();
  });

  it('registers count command', () => {
    const program = makeProgram();
    const cmd = program.commands.find(c => c.name() === 'count');
    expect(cmd).toBeDefined();
  });
});
