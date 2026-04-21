const { getSession, writeSessions, readSessions } = require('./storage');

const VALID_PRIORITIES = ['low', 'medium', 'high', 'critical'];

function setPriority(sessions, name, priority) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  if (!VALID_PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority "${priority}". Must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  session.priority = priority;
  return sessions;
}

function clearPriority(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.priority;
  return sessions;
}

function listByPriority(sessions, priority) {
  if (priority && !VALID_PRIORITIES.includes(priority)) {
    throw new Error(`Invalid priority "${priority}". Must be one of: ${VALID_PRIORITIES.join(', ')}`);
  }
  return Object.entries(sessions)
    .filter(([, s]) => priority ? s.priority === priority : !!s.priority)
    .sort((a, b) => {
      const ai = VALID_PRIORITIES.indexOf(a[1].priority);
      const bi = VALID_PRIORITIES.indexOf(b[1].priority);
      return bi - ai;
    })
    .map(([name, s]) => ({ name, priority: s.priority, urls: s.urls }));
}

function registerPriorityCommand(program) {
  const cmd = program.command('priority');

  cmd
    .command('set <session> <priority>')
    .description('set priority for a session (low, medium, high, critical)')
    .action(async (name, priority) => {
      const sessions = await readSessions();
      const updated = setPriority(sessions, name, priority);
      await writeSessions(updated);
      console.log(`Priority for "${name}" set to "${priority}"`);
    });

  cmd
    .command('clear <session>')
    .description('remove priority from a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const updated = clearPriority(sessions, name);
      await writeSessions(updated);
      console.log(`Priority cleared for "${name}"`);
    });

  cmd
    .command('list [priority]')
    .description('list sessions by priority level')
    .action(async (priority) => {
      const sessions = await readSessions();
      const results = listByPriority(sessions, priority);
      if (results.length === 0) {
        console.log('No sessions found with priority set.');
        return;
      }
      results.forEach(({ name, priority: p, urls }) => {
        console.log(`[${p.toUpperCase()}] ${name} (${urls.length} url${urls.length !== 1 ? 's' : ''})`);
      });
    });
}

module.exports = { setPriority, clearPriority, listByPriority, registerPriorityCommand };
