const { setReminder, clearReminder, listReminders } = require('./cli-remind-handler');

describe('remind full workflow', () => {
  it('set, list, clear cycle', () => {
    let sessions = {
      alpha: { urls: ['https://alpha.io'] },
      beta: { urls: ['https://beta.io'] },
    };

    sessions = setReminder(sessions, 'alpha', 'Review alpha', '2099-07-15');
    sessions = setReminder(sessions, 'beta', 'Review beta', '2099-06-01');

    let reminders = listReminders(sessions);
    expect(reminders).toHaveLength(2);
    expect(reminders[0].name).toBe('beta');
    expect(reminders[1].name).toBe('alpha');
    reminders.forEach(r => expect(r.overdue).toBe(false));

    sessions = clearReminder(sessions, 'beta');
    reminders = listReminders(sessions);
    expect(reminders).toHaveLength(1);
    expect(reminders[0].name).toBe('alpha');
  });

  it('overwriting a reminder replaces it', () => {
    let sessions = {
      work: { urls: [], reminder: { message: 'old', date: '2099-01-01T00:00:00.000Z' } },
    };
    sessions = setReminder(sessions, 'work', 'new message', '2099-12-31');
    expect(sessions.work.reminder.message).toBe('new message');
    expect(new Date(sessions.work.reminder.date).getMonth()).toBe(11);
  });
});
