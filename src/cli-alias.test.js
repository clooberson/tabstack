const { setAlias, removeAlias, resolveAlias, listAliases, registerAliasCommand } = require('./cli-alias-handler');
const { readSessions, writeSessions } = require('./storage');
const { Command } = require('commander');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerAliasCommand(program);
  return program;
}

const baseSessions = () => ({
  work: { urls: ['https://example.com'], alias: undefined },
  personal: { urls: ['https://github.com'], alias: 'gh' },
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('setAlias', () => {
  it('sets an alias on an existing session', () => {
    const sessions = baseSessions();
    readSessions.mockReturnValue(sessions);
    setAlias('work', 'mywork');
    expect(writeSessions).toHaveBeenCalledWith(
      expect.objectContaining({ work: expect.objectContaining({ alias: 'mywork' }) })
    );
  });

  it('throws if session does not exist', () => {
    readSessions.mockReturnValue(baseSessions());
    expect(() => setAlias('nope', 'x')).toThrow('not found');
  });

  it('throws if alias is already used by another session', () => {
    readSessions.mockReturnValue(baseSessions());
    expect(() => setAlias('work', 'gh')).toThrow('already used');
  });
});

describe('removeAlias', () => {
  it('removes an existing alias', () => {
    const sessions = baseSessions();
    readSessions.mockReturnValue(sessions);
    removeAlias('personal');
    expect(writeSessions).toHaveBeenCalled();
  });

  it('throws if session has no alias', () => {
    readSessions.mockReturnValue(baseSessions());
    expect(() => removeAlias('work')).toThrow('no alias');
  });
});

describe('resolveAlias', () => {
  it('returns session name if it exists directly', () => {
    readSessions.mockReturnValue(baseSessions());
    expect(resolveAlias('work')).toBe('work');
  });

  it('resolves alias to session name', () => {
    readSessions.mockReturnValue(baseSessions());
    expect(resolveAlias('gh')).toBe('personal');
  });

  it('returns null if not found', () => {
    readSessions.mockReturnValue(baseSessions());
    expect(resolveAlias('unknown')).toBeNull();
  });
});

describe('listAliases', () => {
  it('returns only sessions with aliases', () => {
    readSessions.mockReturnValue(baseSessions());
    const result = listAliases();
    expect(result).toEqual([{ name: 'personal', alias: 'gh' }]);
  });
});

describe('alias CLI command', () => {
  it('alias set prints confirmation', async () => {
    const sessions = baseSessions();
    readSessions.mockReturnValue(sessions);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['alias', 'set', 'work', 'wk'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('wk'));
    spy.mockRestore();
  });

  it('alias list prints aliases', async () => {
    readSessions.mockReturnValue(baseSessions());
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['alias', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('gh -> personal'));
    spy.mockRestore();
  });
});
