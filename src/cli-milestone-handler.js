const { readSessions, writeSessions } = require('./storage');

function setMilestone(sessions, name, milestone) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.milestone = milestone;
  session.milestoneSetAt = new Date().toISOString();
  return sessions;
}

function removeMilestone(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.milestone;
  delete session.milestoneSetAt;
  return sessions;
}

function getMilestone(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.milestone || null;
}

function listByMilestone(sessions, milestone) {
  return Object.entries(sessions)
    .filter(([, s]) => s.milestone === milestone)
    .map(([name, s]) => ({ name, urls: s.urls, milestone: s.milestone, milestoneSetAt: s.milestoneSetAt }));
}

function getAllMilestones(sessions) {
  const milestones = new Set();
  for (const s of Object.values(sessions)) {
    if (s.milestone) milestones.add(s.milestone);
  }
  return [...milestones].sort();
}

function registerMilestoneCommand(program) {
  const cmd = program.command('milestone').description('Manage session milestones');

  cmd.command('set <session> <milestone>')
    .description('Set a milestone on a session')
    .action(async (session, milestone) => {
      const sessions = await readSessions();
      const updated = setMilestone(sessions, session, milestone);
      await writeSessions(updated);
      console.log(`Milestone "${milestone}" set on "${session}"`);
    });

  cmd.command('remove <session>')
    .description('Remove milestone from a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const updated = removeMilestone(sessions, session);
      await writeSessions(updated);
      console.log(`Milestone removed from "${session}"`);
    });

  cmd.command('get <session>')
    .description('Get milestone for a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const milestone = getMilestone(sessions, session);
      console.log(milestone ? `Milestone: ${milestone}` : 'No milestone set');
    });

  cmd.command('list [milestone]')
    .description('List sessions by milestone, or list all milestones')
    .action(async (milestone) => {
      const sessions = await readSessions();
      if (milestone) {
        const results = listByMilestone(sessions, milestone);
        if (!results.length) return console.log(`No sessions with milestone "${milestone}"`);
        results.forEach(r => console.log(`  ${r.name} (${r.urls.length} urls)`));
      } else {
        const all = getAllMilestones(sessions);
        if (!all.length) return console.log('No milestones defined');
        all.forEach(m => console.log(`  ${m}`));
      }
    });
}

module.exports = { setMilestone, removeMilestone, getMilestone, listByMilestone, getAllMilestones, registerMilestoneCommand };
