const { getSession, writeSessions, readSessions } = require('./storage');

const VALID_COLORS = ['red', 'green', 'blue', 'yellow', 'purple', 'orange', 'pink', 'cyan', 'none'];

function setColor(sessions, name, color) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  if (!VALID_COLORS.includes(color)) {
    throw new Error(`Invalid color "${color}". Valid colors: ${VALID_COLORS.join(', ')}`);
  }
  if (color === 'none') {
    delete session.color;
  } else {
    session.color = color;
  }
  return sessions;
}

function getColor(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.color || null;
}

function registerColorCommand(program) {
  const color = program
    .command('color')
    .description('manage session label colors');

  color
    .command('set <session> <color>')
    .description(`set a color label for a session (${VALID_COLORS.join(', ')})`)
    .action(async (name, colorValue) => {
      try {
        const sessions = await readSessions();
        const updated = setColor(sessions, name, colorValue);
        await writeSessions(updated);
        if (colorValue === 'none') {
          console.log(`Color removed from session "${name}"`);
        } else {
          console.log(`Session "${name}" labeled with color "${colorValue}"`);
        }
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  color
    .command('get <session>')
    .description('get the color label of a session')
    .action(async (name) => {
      try {
        const sessions = await readSessions();
        const c = getColor(sessions, name);
        if (c) {
          console.log(`Session "${name}" color: ${c}`);
        } else {
          console.log(`Session "${name}" has no color label`);
        }
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  color
    .command('list')
    .description('list all sessions with color labels')
    .action(async () => {
      const sessions = await readSessions();
      const colored = Object.entries(sessions).filter(([, s]) => s.color);
      if (colored.length === 0) {
        console.log('No sessions have color labels.');
      } else {
        colored.forEach(([name, s]) => console.log(`${name}: ${s.color}`));
      }
    });
}

module.exports = { setColor, getColor, registerColorCommand, VALID_COLORS };
