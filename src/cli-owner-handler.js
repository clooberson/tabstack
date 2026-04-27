const { readSessions, writeSessions } = require('./storage');

function setOwner(sessions, name, owner) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.owner = owner;
  return sessions;
}

function removeOwner(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.owner;
  return sessions;
}

function getOwner(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.owner || null;
}

function listByOwner(sessions, owner) {
  return Object.entries(sessions)
    .filter(([, s]) => s.owner === owner)
    .map(([name, s]) => ({ name, ...s }));
}

function getAllOwners(sessions) {
  const owners = new Set();
  for (const s of Object.values(sessions)) {
    if (s.owner) owners.add(s.owner);
  }
  return [...owners].sort();
}

function registerOwnerCommand(program) {
  const owner = program.command('owner').description('manage session ownership');

  owner
    .command('set <session> <owner>')
    .description('set owner for a session')
    .action(async (session, ownerName) => {
      const sessions = await readSessions();
      const updated = setOwner(sessions, session, ownerName);
      await writeSessions(updated);
      console.log(`Owner of "${session}" set to "${ownerName}"`);
    });

  owner
    .command('remove <session>')
    .description('remove owner from a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const updated = removeOwner(sessions, session);
      await writeSessions(updated);
      console.log(`Owner removed from "${session}"`);
    });

  owner
    .command('get <session>')
    .description('get owner of a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const ownerName = getOwner(sessions, session);
      console.log(ownerName ? `Owner: ${ownerName}` : `No owner set for "${session}"`);
    });

  owner
    .command('list <owner>')
    .description('list sessions by owner')
    .action(async (ownerName) => {
      const sessions = await readSessions();
      const results = listByOwner(sessions, ownerName);
      if (results.length === 0) {
        console.log(`No sessions found for owner "${ownerName}"`);
      } else {
        results.forEach(s => console.log(`  ${s.name}`));
      }
    });

  owner
    .command('all')
    .description('list all owners')
    .action(async () => {
      const sessions = await readSessions();
      const owners = getAllOwners(sessions);
      if (owners.length === 0) {
        console.log('No owners defined.');
      } else {
        owners.forEach(o => console.log(`  ${o}`));
      }
    });
}

module.exports = { setOwner, removeOwner, getOwner, listByOwner, getAllOwners, registerOwnerCommand };
