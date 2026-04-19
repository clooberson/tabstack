const { getSession } = require('./storage');

function diffSessions(nameA, nameB) {
  const sessionA = getSession(nameA);
  const sessionB = getSession(nameB);

  if (!sessionA) throw new Error(`Session "${nameA}" not found`);
  if (!sessionB) throw new Error(`Session "${nameB}" not found`);

  const urlsA = new Set(sessionA.urls);
  const urlsB = new Set(sessionB.urls);

  const onlyInA = sessionA.urls.filter(u => !urlsB.has(u));
  const onlyInB = sessionB.urls.filter(u => !urlsA.has(u));
  const inBoth = sessionA.urls.filter(u => urlsB.has(u));

  return { onlyInA, onlyInB, inBoth };
}

function registerDiffCommand(program) {
  program
    .command('diff <sessionA> <sessionB>')
    .description('show differences between two sessions')
    .option('--only-unique', 'only show urls not shared between sessions')
    .action((sessionA, sessionB, options) => {
      try {
        const { onlyInA, onlyInB, inBoth } = diffSessions(sessionA, sessionB);

        if (onlyInA.length > 0) {
          console.log(`\nOnly in "${sessionA}" (${onlyInA.length}):`);
          onlyInA.forEach(u => console.log(`  - ${u}`));
        }

        if (onlyInB.length > 0) {
          console.log(`\nOnly in "${sessionB}" (${onlyInB.length}):`);
          onlyInB.forEach(u => console.log(`  + ${u}`));
        }

        if (!options.onlyUnique && inBoth.length > 0) {
          console.log(`\nIn both (${inBoth.length}):`);
          inBoth.forEach(u => console.log(`    ${u}`));
        }

        if (onlyInA.length === 0 && onlyInB.length === 0) {
          console.log('Sessions are identical.');
        }
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
}

module.exports = { diffSessions, registerDiffCommand };
