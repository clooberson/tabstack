const { Command } = require('commander');
const { setColor, getColor, VALID_COLORS } = require('./cli-color-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com'], color: 'blue' },
    personal: { urls: ['https://reddit.com'] },
  };
}

describe('setColor', () => {
  test('sets a valid color on a session', () => {
    const sessions = makeSessions();
    const result = setColor(sessions, 'personal', 'green');
    expect(result.personal.color).toBe('green');
  });

  test('overwrites existing color', () => {
    const sessions = makeSessions();
    const result = setColor(sessions, 'work', 'red');
    expect(result.work.color).toBe('red');
  });

  test('removes color when set to "none"', () => {
    const sessions = makeSessions();
    const result = setColor(sessions, 'work', 'none');
    expect(result.work.color).toBeUndefined();
  });

  test('throws on unknown session', () => {
    const sessions = makeSessions();
    expect(() => setColor(sessions, 'ghost', 'red')).toThrow('not found');
  });

  test('throws on invalid color', () => {
    const sessions = makeSessions();
    expect(() => setColor(sessions, 'work', 'magenta')).toThrow('Invalid color');
  });

  test('all VALID_COLORS are accepted', () => {
    VALID_COLORS.filter(c => c !== 'none').forEach(c => {
      const sessions = makeSessions();
      expect(() => setColor(sessions, 'work', c)).not.toThrow();
    });
  });
});

describe('getColor', () => {
  test('returns color when set', () => {
    const sessions = makeSessions();
    expect(getColor(sessions, 'work')).toBe('blue');
  });

  test('returns null when no color set', () => {
    const sessions = makeSessions();
    expect(getColor(sessions, 'personal')).toBeNull();
  });

  test('throws on unknown session', () => {
    const sessions = makeSessions();
    expect(() => getColor(sessions, 'missing')).toThrow('not found');
  });
});
