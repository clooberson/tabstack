const { readSessions, writeSessions } = require('./storage');

function setNamespace(sessions, sessionName, namespace) {
  const session = sessions[sessionName];
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  session.namespace = namespace || null;
  return sessions;
}

function removeNamespace(sessions, sessionName) {
  const session = sessions[sessionName];
  if (!session) throw new Error(`Session "${sessionName}" not found`);
  delete session.namespace;
  return sessions;
}

function listByNamespace(sessions, namespace) {
  return Object.entries(sessions)
    .filter(([, s]) => (namespace ? s.namespace === namespace : !s.namespace))
    .map(([name, s]) => ({ name, namespace: s.namespace || null, urlCount: s.urls.length }));
}

function getAllNamespaces(sessions) {
  const ns = new Set();
  for (const s of Object.values(sessions)) {
    if (s.namespace) ns.add(s.namespace);
  }
  return [...ns].sort();
}

function registerNamespaceCommand(program) {
  const ns = program.command('namespace').description('manage session namespaces');

  ns.command('set <session> <namespace>')
    .description('assign a namespace to a session')
    .action(async (session, namespace) => {
      const sessions = await readSessions();
      const updated = setNamespace(sessions, session, namespace);
      await writeSessions(updated);
      console.log(`Namespace "${namespace}" set on "${session}"`);
    });

  ns.command('remove <session>')
    .description('remove namespace from a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const updated = removeNamespace(sessions, session);
      await writeSessions(updated);
      console.log(`Namespace removed from "${session}"`);
    });

  ns.command('list [namespace]')
    .description('list sessions in a namespace (or unnamespaced if omitted)')
    .action(async (namespace) => {
      const sessions = await readSessions();
      const results = listByNamespace(sessions, namespace);
      if (!results.length) {
        console.log(namespace ? `No sessions in namespace "${namespace}"` : 'No unnamespaced sessions');
        return;
      }
      results.forEach(({ name, namespace: ns, urlCount }) =>
        console.log(`  ${name} [${ns || '(none)'}] — ${urlCount} url(s)`)
      );
    });

  ns.command('all')
    .description('list all namespaces in use')
    .action(async () => {
      const sessions = await readSessions();
      const namespaces = getAllNamespaces(sessions);
      if (!namespaces.length) { console.log('No namespaces defined'); return; }
      namespaces.forEach(n => console.log(` ${n}`));
    });
}

module.exports = { setNamespace, removeNamespace, listByNamespace, getAllNamespaces, registerNamespaceCommand };
