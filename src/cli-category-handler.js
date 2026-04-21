const { readSessions, writeSessions } = require('./storage');

function setCategory(sessions, name, category) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.category = category;
  return sessions;
}

function removeCategory(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.category;
  return sessions;
}

function listByCategory(sessions, category) {
  return Object.entries(sessions)
    .filter(([, s]) => s.category === category)
    .map(([name, s]) => ({ name, ...s }));
}

function getAllCategories(sessions) {
  const cats = new Set();
  for (const s of Object.values(sessions)) {
    if (s.category) cats.add(s.category);
  }
  return [...cats].sort();
}

function registerCategoryCommand(program) {
  const cat = program.command('category').description('manage session categories');

  cat
    .command('set <session> <category>')
    .description('assign a category to a session')
    .action(async (name, category) => {
      const sessions = await readSessions();
      const updated = setCategory(sessions, name, category);
      await writeSessions(updated);
      console.log(`Category "${category}" set for session "${name}"`);
    });

  cat
    .command('remove <session>')
    .description('remove category from a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const updated = removeCategory(sessions, name);
      await writeSessions(updated);
      console.log(`Category removed from session "${name}"`);
    });

  cat
    .command('list [category]')
    .description('list sessions by category, or list all categories')
    .action(async (category) => {
      const sessions = await readSessions();
      if (category) {
        const results = listByCategory(sessions, category);
        if (!results.length) return console.log(`No sessions in category "${category}"`);
        results.forEach(s => console.log(`  ${s.name} (${s.urls?.length ?? 0} urls)`));
      } else {
        const cats = getAllCategories(sessions);
        if (!cats.length) return console.log('No categories found');
        cats.forEach(c => console.log(`  ${c}`));
      }
    });
}

module.exports = { setCategory, removeCategory, listByCategory, getAllCategories, registerCategoryCommand };
