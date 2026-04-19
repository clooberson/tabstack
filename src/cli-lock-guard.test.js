const { guardLocked } = require('./cli-lock-guard');
const { readSessions } = require('./storage');

jest.mock('./storage');

beforeEach(() => {
  readSessions.mockReturnValue({
    work: { urls: ['https://github.com'] },
    secure: { urls: ['https://bank.com'], locked: true },
  });
});

test('guardLocked does not throw for unlocked session', () => {
  expect(() => guardLocked('work')).not.toThrow();
});

test('guardLocked throws for locked session', () => {
  expect(() => guardLocked('secure')).toThrow('locked');
  expect(() => guardLocked('secure')).toThrow('unlock');
});

test('guardLocked does not throw for missing session', () => {
  expect(() => guardLocked('ghost')).not.toThrow();
});
