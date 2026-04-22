const { readSessions, writeSessions } = require('./storage');

function setScope(sessions, name, scope) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  const validScopes = ['personal', 'work', 'shared', 'project'];
  if (!validScopes.includes(scope)) {
    throw new Error(`Invalid scope "${scope}". Valid scopes: ${validScopes.join(', ')}`);
  }
  session.scope = scope;
  return sessions;
}

function removeScope(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.scope;
  return sessions;
}

function getScope(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.scope || null;
}

function listByScope(sessions, scope) {
  return Object.entries(sessions)
    .filter(([, s]) => s.scope === scope)
    .map(([name, s]) => ({ name, ...s }));
}

function registerScopeCommand(program) {
  const scope = program.command('scope').description('Manage session scopes');

  scope
    .command('set <session> <scope>')
    .description('Set scope for a session (personal, work, shared, project)')
    .action(async (name, scopeVal) => {
      const sessions = await readSessions();
      const updated = setScope(sessions, name, scopeVal);
      await writeSessions(updated);
      console.log(`Scope for "${name}" set to "${scopeVal}"`);
    });

  scope
    .command('remove <session>')
    .description('Remove scope from a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const updated = removeScope(sessions, name);
      await writeSessions(updated);
      console.log(`Scope removed from "${name}"`);
    });

  scope
    .command('get <session>')
    .description('Get scope of a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const val = getScope(sessions, name);
      console.log(val ? `Scope: ${val}` : `No scope set for "${name}"`);
    });

  scope
    .command('list <scope>')
    .description('List sessions by scope')
    .action(async (scopeVal) => {
      const sessions = await readSessions();
      const results = listByScope(sessions, scopeVal);
      if (results.length === 0) {
        console.log(`No sessions with scope "${scopeVal}"`);
      } else {
        results.forEach(s => console.log(`  ${s.name} (${s.urls ? s.urls.length : 0} urls)`));
      }
    });
}

module.exports = { setScope, removeScope, getScope, listByScope, registerScopeCommand };
