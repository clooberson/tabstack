const { Command } = require('commander');
const { compressSession, compressAll, registerCompressCommand } = require('./cli-compress-handler');
const { readSessions, writeSessions } = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerCompressCommand(program);
  return program;
}

const makeSessions = () => [
  { name: 'work', urls: ['https://a.com', 'https://b.com', 'https://a.com'], tags: [] },
  { name: 'personal', urls: ['https://x.com', 'https://x.com', 'https://y.com'], tags: [] },
];

describe('compressSession', () => {
  it('removes duplicate URLs', () => {
    const session = { name: 'test', urls: ['https://a.com', 'https://b.com', 'https://a.com'] };
    const result = compressSession(session);
    expect(result.urls).toEqual(['https://a.com', 'https://b.com']);
  });

  it('sets compressed flag and timestamp', () => {
    const session = { name: 'test', urls: ['https://a.com'] };
    const result = compressSession(session);
    expect(result.compressed).toBe(true);
    expect(result.compressedAt).toBeDefined();
  });

  it('preserves order of first occurrences', () => {
    const session = { name: 'test', urls: ['https://c.com', 'https://a.com', 'https://c.com', 'https://b.com'] };
    const result = compressSession(session);
    expect(result.urls).toEqual(['https://c.com', 'https://a.com', 'https://b.com']);
  });
});

describe('compressAll', () => {
  it('compresses all sessions', () => {
    const sessions = makeSessions();
    const result = compressAll(sessions);
    expect(result[0].urls).toEqual(['https://a.com', 'https://b.com']);
    expect(result[1].urls).toEqual(['https://x.com', 'https://y.com']);
  });
});

describe('compress command', () => {
  beforeEach(() => jest.clearAllMocks());

  it('compresses a named session', () => {
    readSessions.mockReturnValue(makeSessions());
    const program = makeProgram();
    program.parse(['compress', 'work'], { from: 'user' });
    expect(writeSessions).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'work', urls: ['https://a.com', 'https://b.com'] })
      ])
    );
  });

  it('compresses all sessions with --all', () => {
    readSessions.mockReturnValue(makeSessions());
    const program = makeProgram();
    program.parse(['compress', '--all'], { from: 'user' });
    const written = writeSessions.mock.calls[0][0];
    expect(written[0].urls).toEqual(['https://a.com', 'https://b.com']);
    expect(written[1].urls).toEqual(['https://x.com', 'https://y.com']);
  });

  it('exits if session not found', () => {
    readSessions.mockReturnValue(makeSessions());
    const program = makeProgram();
    expect(() => program.parse(['compress', 'ghost'], { from: 'user' })).toThrow();
  });
});
