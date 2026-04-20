const { readSessions, writeSessions } = require('./storage');

const VALID_COLORS = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'gray', 'none'];

function setColor(sessionName, color) {
  if (!VALID_COLORS.includes(color)) {
    throw new Error(`Invalid color '${color}'. Valid colors: ${VALID_COLORS.join(', ')}`);
  }
  const sessions = readSessions();
  if (!sessions[sessionName]) {
    throw new Error(`Session '${sessionName}' not found`);
  }
  if (color === 'none') {
    delete sessions[sessionName].color;
  } else {
    sessions[sessionName].color = color;
  }
  writeSessions(sessions);
  return color;
}

function getColor(sessionName) {
  const sessions = readSessions();
  if (!sessions[sessionName]) {
    throw new Error(`Session '${sessionName}' not found`);
  }
  return sessions[sessionName].color || null;
}

function registerColorCommand(program) {
  const color = program
    .command('color')
    .description('Manage session colors for visual organization');

  color
    .command('set <session> <color>')
    .description(`Set a color label for a session (${VALID_COLORS.join(', ')})`)
    .action((session, colorValue) => {
      try {
        setColor(session, colorValue);
        if (colorValue === 'none') {
          console.log(`Cleared color for session '${session}'`);
        } else {
          console.log(`Set color '${colorValue}' for session '${session}'`);
        }
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  color
    .command('get <session>')
    .description('Get the color label for a session')
    .action((session) => {
      try {
        const c = getColor(session);
        if (c) {
          console.log(c);
        } else {
          console.log(`No color set for session '${session}'`);
        }
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  color
    .command('list')
    .description('List all sessions with their colors')
    .action(() => {
      const sessions = readSessions();
      const entries = Object.entries(sessions).filter(([, s]) => s.color);
      if (entries.length === 0) {
        console.log('No sessions have colors set.');
        return;
      }
      entries.forEach(([name, s]) => {
        console.log(`${name}: ${s.color}`);
      });
    });
}

module.exports = { setColor, getColor, registerColorCommand, VALID_COLORS };
