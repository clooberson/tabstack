const { readSessions, writeSessions } = require('./storage');

const VALID_TIMEZONES = Intl.supportedValuesOf
  ? Intl.supportedValuesOf('timeZone')
  : [];

function isValidTimezone(tz) {
  if (VALID_TIMEZONES.length > 0) return VALID_TIMEZONES.includes(tz);
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

function setTimezone(sessions, name, timezone) {
  if (!sessions[name]) throw new Error(`Session "${name}" not found`);
  if (!isValidTimezone(timezone)) throw new Error(`Invalid timezone: "${timezone}"`);
  sessions[name].timezone = timezone;
  return sessions;
}

function removeTimezone(sessions, name) {
  if (!sessions[name]) throw new Error(`Session "${name}" not found`);
  delete sessions[name].timezone;
  return sessions;
}

function getTimezone(sessions, name) {
  if (!sessions[name]) throw new Error(`Session "${name}" not found`);
  return sessions[name].timezone || null;
}

function listByTimezone(sessions, timezone) {
  return Object.entries(sessions)
    .filter(([, s]) => s.timezone === timezone)
    .map(([name, s]) => ({ name, ...s }));
}

function registerTimezoneCommand(program) {
  const tz = program
    .command('timezone')
    .description('manage timezone metadata for sessions');

  tz.command('set <session> <timezone>')
    .description('set timezone for a session')
    .action(async (session, timezone) => {
      const sessions = await readSessions();
      const updated = setTimezone(sessions, session, timezone);
      await writeSessions(updated);
      console.log(`Timezone for "${session}" set to ${timezone}`);
    });

  tz.command('get <session>')
    .description('get timezone for a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const zone = getTimezone(sessions, session);
      console.log(zone ? zone : `No timezone set for "${session}"`);
    });

  tz.command('remove <session>')
    .description('remove timezone from a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const updated = removeTimezone(sessions, session);
      await writeSessions(updated);
      console.log(`Timezone removed from "${session}"`);
    });

  tz.command('list <timezone>')
    .description('list sessions with a given timezone')
    .action(async (timezone) => {
      const sessions = await readSessions();
      const results = listByTimezone(sessions, timezone);
      if (results.length === 0) {
        console.log(`No sessions with timezone "${timezone}"`);
      } else {
        results.forEach(s => console.log(s.name));
      }
    });
}

module.exports = { setTimezone, removeTimezone, getTimezone, listByTimezone, registerTimezoneCommand };
