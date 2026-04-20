const { setReminder, clearReminder, listReminders } = require('./cli-remind-handler');

describe('setReminder', () => {
  it('attaches reminder to session', () => {
    const sessions = { work: { urls: ['https://example.com'] } };
    const result = setReminder(sessions, 'work', 'Check this', '2099-12-01');
    expect(result.work.reminder).toBeDefined();
    expect(result.work.reminder.message).toBe('Check this');
    expect(new Date(result.work.reminder.date).getFullYear()).toBe(2099);
  });

  it('throws if session not found', () => {
    expect(() => setReminder({}, 'missing', 'msg', '2099-01-01')).toThrow('not found');
  });

  it('throws on invalid date', () => {
    const sessions = { work: { urls: [] } };
    expect(() => setReminder(sessions, 'work', 'msg', 'not-a-date')).toThrow('Invalid date');
  });
});

describe('clearReminder', () => {
  it('removes reminder from session', () => {
    const sessions = { work: { urls: [], reminder: { message: 'hi', date: '2099-01-01' } } };
    const result = clearReminder(sessions, 'work');
    expect(result.work.reminder).toBeUndefined();
  });

  it('throws if session not found', () => {
    expect(() => clearReminder({}, 'ghost')).toThrow('not found');
  });
});

describe('listReminders', () => {
  it('returns only sessions with reminders', () => {
    const sessions = {
      a: { urls: [], reminder: { message: 'a', date: '2099-05-01T00:00:00.000Z' } },
      b: { urls: [] },
      c: { urls: [], reminder: { message: 'c', date: '2099-03-01T00:00:00.000Z' } },
    };
    const result = listReminders(sessions);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('c');
    expect(result[1].name).toBe('a');
  });

  it('marks overdue reminders', () => {
    const sessions = {
      old: { urls: [], reminder: { message: 'past', date: '2000-01-01T00:00:00.000Z' } },
    };
    const result = listReminders(sessions);
    expect(result[0].overdue).toBe(true);
  });

  it('returns empty array when no reminders', () => {
    expect(listReminders({ x: { urls: [] } })).toEqual([]);
  });
});
