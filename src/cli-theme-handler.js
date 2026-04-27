const { readSessions, writeSessions } = require('./storage');

const VALID_THEMES = ['default', 'dark', 'light', 'solarized', 'monokai', 'nord'];

function setTheme(sessions, name, theme) {
  if (!VALID_THEMES.includes(theme)) {
    throw new Error(`Invalid theme "${theme}". Valid themes: ${VALID_THEMES.join(', ')}`);
  }
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.theme = theme;
  return sessions;
}

function removeTheme(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.theme;
  return sessions;
}

function getTheme(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.theme || null;
}

function listByTheme(sessions, theme) {
  return Object.entries(sessions)
    .filter(([, s]) => s.theme === theme)
    .map(([name, s]) => ({ name, ...s }));
}

function registerThemeCommand(program) {
  const theme = program.command('theme').description('manage session themes');

  theme
    .command('set <session> <theme>')
    .description(`set theme for a session (${VALID_THEMES.join(', ')})`)
    .action(async (session, themeValue) => {
      const sessions = await readSessions();
      const updated = setTheme(sessions, session, themeValue);
      await writeSessions(updated);
      console.log(`Theme "${themeValue}" set for session "${session}"`);
    });

  theme
    .command('remove <session>')
    .description('remove theme from a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const updated = removeTheme(sessions, session);
      await writeSessions(updated);
      console.log(`Theme removed from session "${session}"`);
    });

  theme
    .command('get <session>')
    .description('get theme of a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const t = getTheme(sessions, session);
      console.log(t ? `Theme: ${t}` : `No theme set for "${session}"`);
    });

  theme
    .command('list <theme>')
    .description('list sessions with a given theme')
    .action(async (themeValue) => {
      const sessions = await readSessions();
      const results = listByTheme(sessions, themeValue);
      if (results.length === 0) {
        console.log(`No sessions with theme "${themeValue}"`);
      } else {
        results.forEach(s => console.log(`  ${s.name}`));
      }
    });
}

module.exports = { setTheme, removeTheme, getTheme, listByTheme, registerThemeCommand, VALID_THEMES };
