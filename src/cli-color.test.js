const { Command } = require('commander');
const { setColor, getColor, VALID_COLORS } = require('./cli-color-handler');
const { readSessions, writeSessions } = require('./storage');

jest.mock('./storage');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], color: 'blue' },
    personal: { urls: ['https://reddit.com'] },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('setColor', () => {
  it('sets a valid color on a session', () => {
    const sessions = makeSessions();
    readSessions.mockReturnValue(sessions);
    setColor('personal', 'green');
    expect(writeSessions).toHaveBeenCalledWith(
      expect.objectContaining({
        personal: expect.objectContaining({ color: 'green' }),
      })
    );
  });

  it('removes color when set to none', () => {
    const sessions = makeSessions();
    readSessions.mockReturnValue(sessions);
    setColor('work', 'none');
    const written = writeSessions.mock.calls[0][0];
    expect(written.work.color).toBeUndefined();
  });

  it('throws on invalid color', () => {
    readSessions.mockReturnValue(makeSessions());
    expect(() => setColor('work', 'rainbow')).toThrow("Invalid color 'rainbow'");
  });

  it('throws if session does not exist', () => {
    readSessions.mockReturnValue(makeSessions());
    expect(() => setColor('ghost', 'red')).toThrow("Session 'ghost' not found");
  });
});

describe('getColor', () => {
  it('returns the color of a session', () => {
    readSessions.mockReturnValue(makeSessions());
    expect(getColor('work')).toBe('blue');
  });

  it('returns null if no color set', () => {
    readSessions.mockReturnValue(makeSessions());
    expect(getColor('personal')).toBeNull();
  });

  it('throws if session does not exist', () => {
    readSessions.mockReturnValue(makeSessions());
    expect(() => getColor('ghost')).toThrow("Session 'ghost' not found");
  });
});

describe('VALID_COLORS', () => {
  it('includes none as an option', () => {
    expect(VALID_COLORS).toContain('none');
  });

  it('includes common colors', () => {
    expect(VALID_COLORS).toContain('red');
    expect(VALID_COLORS).toContain('blue');
    expect(VALID_COLORS).toContain('green');
  });
});
