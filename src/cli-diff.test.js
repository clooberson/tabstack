const { Command } = require('commander');
const { registerDiffCommand, diffSessions } = require('./cli-diff-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerDiffCommand(program);
  return program;
}

describe('diffSessions', () => {
  it('returns urls only in A, only in B, and in both', () => {
    storage.getSession
      .mockReturnValueOnce({ urls: ['http://a.com', 'http://shared.com'] })
      .mockReturnValueOnce({ urls: ['http://b.com', 'http://shared.com'] });

    const result = diffSessions('work', 'personal');
    expect(result.onlyInA).toEqual(['http://a.com']);
    expect(result.onlyInB).toEqual(['http://b.com']);
    expect(result.inBoth).toEqual(['http://shared.com']);
  });

  it('throws if session A not found', () => {
    storage.getSession.mockReturnValueOnce(null);
    expect(() => diffSessions('missing', 'other')).toThrow('Session "missing" not found');
  });

  it('throws if session B not found', () => {
    storage.getSession
      .mockReturnValueOnce({ urls: ['http://a.com'] })
      .mockReturnValueOnce(null);
    expect(() => diffSessions('work', 'missing')).toThrow('Session "missing" not found');
  });

  it('reports identical sessions', () => {
    const urls = ['http://same.com'];
    storage.getSession.mockReturnValue({ urls });
    const result = diffSessions('a', 'b');
    expect(result.onlyInA).toHaveLength(0);
    expect(result.onlyInB).toHaveLength(0);
    expect(result.inBoth).toHaveLength(1);
  });
});

describe('diff command', () => {
  it('runs without error when sessions differ', () => {
    storage.getSession
      .mockReturnValueOnce({ urls: ['http://a.com'] })
      .mockReturnValueOnce({ urls: ['http://b.com'] });
    const program = makeProgram();
    expect(() => program.parse(['diff', 'work', 'personal'], { from: 'user' })).not.toThrow();
  });
});
