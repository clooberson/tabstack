const { setRating, clearRating, listByRating } = require('./cli-rating-handler');
const { Command } = require('commander');
const { registerRatingCommand } = require('./cli-rating-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com', 'https://jira.com'], rating: 4 },
    fun: { urls: ['https://youtube.com'], rating: 2 },
    unrated: { urls: ['https://example.com'] },
  };
}

function makeProgram(sessions) {
  const program = new Command();
  program.exitOverride();
  const { readSessions, writeSessions } = require('./storage');
  jest.mock('./storage');
  readSessions.mockResolvedValue(sessions);
  writeSessions.mockResolvedValue();
  registerRatingCommand(program);
  return program;
}

describe('setRating', () => {
  it('sets a valid rating', () => {
    const sessions = makeSessions();
    setRating(sessions, 'unrated', 3);
    expect(sessions.unrated.rating).toBe(3);
  });

  it('throws for unknown session', () => {
    const sessions = makeSessions();
    expect(() => setRating(sessions, 'ghost', 3)).toThrow('not found');
  });

  it('throws for out-of-range rating', () => {
    const sessions = makeSessions();
    expect(() => setRating(sessions, 'work', 6)).toThrow('between 1 and 5');
    expect(() => setRating(sessions, 'work', 0)).toThrow('between 1 and 5');
  });
});

describe('clearRating', () => {
  it('removes rating from a session', () => {
    const sessions = makeSessions();
    clearRating(sessions, 'work');
    expect(sessions.work.rating).toBeUndefined();
  });

  it('throws for unknown session', () => {
    const sessions = makeSessions();
    expect(() => clearRating(sessions, 'nobody')).toThrow('not found');
  });
});

describe('listByRating', () => {
  it('returns sessions sorted by rating descending', () => {
    const sessions = makeSessions();
    const results = listByRating(sessions, 1);
    expect(results[0].name).toBe('work');
    expect(results[1].name).toBe('fun');
    expect(results.find(r => r.name === 'unrated')).toBeUndefined();
  });

  it('filters by minimum rating', () => {
    const sessions = makeSessions();
    const results = listByRating(sessions, 3);
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('work');
  });

  it('returns empty array when no sessions meet minimum', () => {
    const sessions = makeSessions();
    const results = listByRating(sessions, 5);
    expect(results).toEqual([]);
  });
});
