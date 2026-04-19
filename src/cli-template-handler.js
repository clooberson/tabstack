const { readSessions, writeSessions } = require('./storage');

function listTemplates(sessions) {
  return Object.entries(sessions)
    .filter(([, s]) => s.isTemplate)
    .map(([name, s]) => ({ name, urls: s.urls, tags: s.tags }));
}

function saveAsTemplate(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  sessions[name] = { ...session, isTemplate: true };
  return sessions;
}

function createFromTemplate(sessions, templateName, newName) {
  const template = sessions[templateName];
  if (!template) throw new Error(`Template "${templateName}" not found`);
  if (!template.isTemplate) throw new Error(`"${templateName}" is not a template`);
  if (sessions[newName]) throw new Error(`Session "${newName}" already exists`);
  sessions[newName] = {
    urls: [...template.urls],
    tags: template.tags ? [...template.tags] : [],
    createdAt: new Date().toISOString(),
    isTemplate: false,
  };
  return sessions;
}

function registerTemplateCommand(program) {
  const template = program.command('template').description('manage session templates');

  template
    .command('list')
    .description('list all templates')
    .action(async () => {
      const sessions = await readSessions();
      const templates = listTemplates(sessions);
      if (templates.length === 0) {
        console.log('No templates saved.');
      } else {
        templates.forEach(t => console.log(`${t.name} (${t.urls.length} urls)`));
      }
    });

  template
    .command('mark <name>')
    .description('mark a session as a template')
    .action(async (name) => {
      let sessions = await readSessions();
      sessions = saveAsTemplate(sessions, name);
      await writeSessions(sessions);
      console.log(`Session "${name}" marked as template.`);
    });

  template
    .command('use <templateName> <newName>')
    .description('create a new session from a template')
    .action(async (templateName, newName) => {
      let sessions = await readSessions();
      sessions = createFromTemplate(sessions, templateName, newName);
      await writeSessions(sessions);
      console.log(`Session "${newName}" created from template "${templateName}".`);
    });
}

module.exports = { listTemplates, saveAsTemplate, createFromTemplate, registerTemplateCommand };
