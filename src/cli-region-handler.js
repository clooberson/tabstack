const { readSessions, writeSessions } = require('./storage');

const VALID_REGIONS = [
  'us', 'eu', 'asia', 'au', 'ca', 'uk', 'latam', 'me', 'af', 'global'
];

function setRegion(sessions, name, region) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  if (!VALID_REGIONS.includes(region.toLowerCase())) {
    throw new Error(`Invalid region "${region}". Valid: ${VALID_REGIONS.join(', ')}`);
  }
  session.region = region.toLowerCase();
  return session;
}

function removeRegion(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.region;
  return session;
}

function getRegion(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.region || null;
}

function listByRegion(sessions, region) {
  return Object.entries(sessions)
    .filter(([, s]) => s.region === region.toLowerCase())
    .map(([name, s]) => ({ name, ...s }));
}

function getAllRegions(sessions) {
  const regions = {};
  for (const [name, s] of Object.entries(sessions)) {
    if (s.region) {
      if (!regions[s.region]) regions[s.region] = [];
      regions[s.region].push(name);
    }
  }
  return regions;
}

function registerRegionCommand(program) {
  const region = program.command('region').description('Manage session regions');

  region
    .command('set <session> <region>')
    .description('Set region for a session')
    .action(async (name, reg) => {
      const sessions = await readSessions();
      setRegion(sessions, name, reg);
      await writeSessions(sessions);
      console.log(`Region for "${name}" set to "${reg}"`);
    });

  region
    .command('remove <session>')
    .description('Remove region from a session')
    .action(async (name) => {
      const sessions = await readSessions();
      removeRegion(sessions, name);
      await writeSessions(sessions);
      console.log(`Region removed from "${name}"`);
    });

  region
    .command('get <session>')
    .description('Get region of a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const reg = getRegion(sessions, name);
      console.log(reg ? `Region: ${reg}` : `No region set for "${name}"`);
    });

  region
    .command('list [region]')
    .description('List sessions by region, or all regions if none specified')
    .action(async (reg) => {
      const sessions = await readSessions();
      if (reg) {
        const found = listByRegion(sessions, reg);
        if (!found.length) return console.log(`No sessions in region "${reg}"`);
        found.forEach(s => console.log(`  ${s.name}`));
      } else {
        const all = getAllRegions(sessions);
        if (!Object.keys(all).length) return console.log('No regions set');
        for (const [r, names] of Object.entries(all)) {
          console.log(`${r}: ${names.join(', ')}`);
        }
      }
    });
}

module.exports = { setRegion, removeRegion, getRegion, listByRegion, getAllRegions, registerRegionCommand };
