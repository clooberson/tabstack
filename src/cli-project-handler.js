const { readSessions, writeSessions } = require('./storage');

function setProject(sessions, name, project) {
  if (!sessions[name]) throw new Error(`Session "${name}" not found`);
  sessions[name].project = project;
  return sessions;
}

function removeProject(sessions, name) {
  if (!sessions[name]) throw new Error(`Session "${name}" not found`);
  delete sessions[name].project;
  return sessions;
}

function getProject(sessions, name) {
  if (!sessions[name]) throw new Error(`Session "${name}" not found`);
  return sessions[name].project || null;
}

function listByProject(sessions, project) {
  return Object.entries(sessions)
    .filter(([, s]) => s.project === project)
    .map(([name, s]) => ({ name, ...s }));
}

function getAllProjects(sessions) {
  const projects = new Set(
    Object.values(sessions)
      .map(s => s.project)
      .filter(Boolean)
  );
  return [...projects].sort();
}

function registerProjectCommand(program) {
  const proj = program.command('project').description('Manage session projects');

  proj
    .command('set <session> <project>')
    .description('Assign a session to a project')
    .action(async (session, project) => {
      const sessions = await readSessions();
      const updated = setProject(sessions, session, project);
      await writeSessions(updated);
      console.log(`Session "${session}" assigned to project "${project}"`);
    });

  proj
    .command('remove <session>')
    .description('Remove project from a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const updated = removeProject(sessions, session);
      await writeSessions(updated);
      console.log(`Project removed from session "${session}"`);
    });

  proj
    .command('get <session>')
    .description('Get project for a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const project = getProject(sessions, session);
      console.log(project ? `Project: ${project}` : `No project set for "${session}"`);
    });

  proj
    .command('list [project]')
    .description('List sessions by project, or list all projects')
    .action(async (project) => {
      const sessions = await readSessions();
      if (project) {
        const results = listByProject(sessions, project);
        if (!results.length) return console.log(`No sessions in project "${project}"`);
        results.forEach(s => console.log(`  ${s.name} (${s.urls ? s.urls.length : 0} tabs)`));
      } else {
        const projects = getAllProjects(sessions);
        if (!projects.length) return console.log('No projects defined');
        projects.forEach(p => console.log(`  ${p}`));
      }
    });
}

module.exports = { setProject, removeProject, getProject, listByProject, getAllProjects, registerProjectCommand };
