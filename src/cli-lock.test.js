const { Command } = require('commander');
const { lockSession, unlockSession } = require('./cli-lock-handler');
const { readSessions, writeSessions } = require('./storage');

jest.mock('./storage');

const baseSessions = {
  work: { urls: ['https://github.com'], createdAt: '2024-01-01' },
  personal: { urls: ['https://reddit.com'], createdAt: '2024-01-02', locked: true },
};

beforeEach(() => {
  readSessions.mockReturnValue(JSON.parse(JSON.stringify(baseSessions)));
  writeSessions.mockReset();
});

test('lockSession sets locked flag', () => {
  const result = lockSession('work');
  expect(result.locked).toBe(true);
  expect(writeSessions).toHaveBeenCalled();
});

test('lockSession throws if session not found', () => {
  expect(() => lockSession('missing')).toThrow('not found');
});

test('lockSession throws if already locked', () => {
  expect(() => lockSession('personal')).toThrow('already locked');
});

test('lockSession stores lockHint when password provided', () => {
  const result = lockSession('work', 'secret');
  expect(result.lockHint).toBe('(password set)');
});

test('unlockSession removes locked flag', () => {
  const result = unlockSession('personal');
  expect(result.locked).toBeUndefined();
  expect(writeSessions).toHaveBeenCalled();
});

test('unlockSession throws if session not found', () => {
  expect(() => unlockSession('missing')).toThrow('not found');
});

test('unlockSession throws if session not locked', () => {
  expect(() => unlockSession('work')).toThrow('not locked');
});
