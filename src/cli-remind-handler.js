const { getSession, writeSessions, readSessions } = require('./storage');

function setReminder(sessions, name, message, dateStr) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) throw new Error(`Invalid date: "${dateStr}"`);

  session.reminder = { message, date: date.toISOString() };
  return sessions;
}

function clearReminder(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.reminder;
  return sessions;
}

function listReminders(sessions) {
  const now = new Date();
  return Object.entries(sessions)
    .filter(([, s]) => s.reminder)
    .map(([name, s]) => ({
      name,
      message: s.reminder.message,
      date: s.reminder.date,
      overdue: new Date(s.reminder.date) < now,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function registerRemindCommand(program) {
  const remind = program.command('remind').description('Manage session reminders');

  remind
    .command('set <name> <date> <message>')
    .description('Set a reminder for a session')
    .action(async (name, date, message) => {
      try {
        const sessions = await readSessions();
        const updated = setReminder(sessions, name, message, date);
        await writeSessions(updated);
        console.log(`Reminder set for "${name}" on ${date}`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  remind
    .command('clear <name>')
    .description('Clear reminder for a session')
    .action(async (name) => {
      try {
        const sessions = await readSessions();
        const updated = clearReminder(sessions, name);
        await writeSessions(updated);
        console.log(`Reminder cleared for "${name}"`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  remind
    .command('list')
    .description('List all reminders')
    .action(async () => {
      try {
        const sessions = await readSessions();
        const reminders = listReminders(sessions);
        if (reminders.length === 0) {
          console.log('No reminders set.');
          return;
        }
        reminders.forEach(({ name, message, date, overdue }) => {
          const tag = overdue ? ' [OVERDUE]' : '';
          console.log(`${name}${tag}: "${message}" — ${new Date(date).toLocaleString()}`);
        });
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
}

module.exports = { setReminder, clearReminder, listReminders, registerRemindCommand };
