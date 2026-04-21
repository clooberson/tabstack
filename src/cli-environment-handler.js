const { readSessions, writeSessions } = require('./storage');

function setEnvironment(sessions, name, env) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  const validEnvs = ['development', 'staging', 'production', 'local'];
  if (!validEnvs.includes(env)) {
    throw new Error(`Invalid environment "${env}". Valid: ${validEnvs.join(', ')}`);
  }
  session.environment = env;
  return sessions;
}

function removeEnvironment(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.environment;
  return sessions;
}

function getEnvironment(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.environment || null;
}

function listByEnvironment(sessions, env) {
  return Object.entries(sessions)
    .filter(([, s]) => s.environment === env)
    .map(([name, s]) => ({ name, urls: s.urls, environment: s.environment }));
}

function registerEnvironmentCommand(program) {
  const env = program.command('environment').description('manage session environments');

  env
    .command('set <session> <env>')
    .description('set environment for a session')
    .action(async (session, envValue) => {
      const sessions = await readSessions();
      const updated = setEnvironment(sessions, session, envValue);
      await writeSessions(updated);
      console.log(`Environment for "${session}" set to "${envValue}"`);
    });

  env
    .command('remove <session>')
    .description('remove environment from a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const updated = removeEnvironment(sessions, session);
      await writeSessions(updated);
      console.log(`Environment removed from "${session}"`);
    });

  env
    .command('get <session>')
    .description('get environment for a session')
    .action(async (session) => {
      const sessions = await readSessions();
      const result = getEnvironment(sessions, session);
      console.log(result ? `Environment: ${result}` : `No environment set for "${session}"`);
    });

  env
    .command('list <env>')
    .description('list sessions with a given environment')
    .action(async (envValue) => {
      const sessions = await readSessions();
      const results = listByEnvironment(sessions, envValue);
      if (results.length === 0) {
        console.log(`No sessions with environment "${envValue}"`);
      } else {
        results.forEach(s => console.log(`  ${s.name} (${s.urls.length} urls)`));
      }
    });
}

module.exports = { setEnvironment, removeEnvironment, getEnvironment, listByEnvironment, registerEnvironmentCommand };
