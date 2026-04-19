const { getSession, saveSession } = require('./storage');
const { deleteSession } = require('./storage-mutations');

async function moveSession(fromName, toName, options = {}) {
  const session = await getSession(fromName);
  if (!session) {
    throw new Error(`Session "${fromName}" not found`);
  }

  const existing = await getSession(toName);
  if (existing && !options.force) {
    throw new Error(`Session "${toName}" already exists. Use --force to overwrite.`);
  }

  await saveSession(toName, {
    ...session,
    name: toName,
    movedFrom: fromName,
    movedAt: new Date().toISOString(),
  });

  await deleteSession(fromName);

  return { from: fromName, to: toName, urlCount: session.urls.length };
}

function registerMoveCommand(program) {
  program
    .command('move <from> <to>')
    .description('move a session to a new name (like rename but explicit)')
    .option('-f, --force', 'overwrite destination if it exists')
    .action(async (from, to, options) => {
      try {
        const result = await moveSession(from, to, options);
        console.log(`Moved "${result.from}" → "${result.to}" (${result.urlCount} URLs)`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}

module.exports = { moveSession, registerMoveCommand };
