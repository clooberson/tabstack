/**
 * Sprint handler — associate sessions with sprint/iteration identifiers
 * Useful for dev teams who want to track which tabs belong to which sprint
 */

const { readSessions, writeSessions, getSession } = require('./storage');

/**
 * Set the sprint for a session
 * @param {string} name - session name
 * @param {string} sprint - sprint identifier (e.g. "sprint-42", "2024-Q1")
 */
async function setSprint(name, sprint) {
  const sessions = await readSessions();
  const session = getSession(sessions, name);
  if (!session) throw new Error(`Session "${name}" not found`);
  session.sprint = sprint;
  await writeSessions(sessions);
  return session;
}

/**
 * Remove the sprint from a session
 * @param {string} name - session name
 */
async function removeSprint(name) {
  const sessions = await readSessions();
  const session = getSession(sessions, name);
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.sprint;
  await writeSessions(sessions);
  return session;
}

/**
 * Get the sprint for a session
 * @param {string} name - session name
 */
async function getSprint(name) {
  const sessions = await readSessions();
  const session = getSession(sessions, name);
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.sprint || null;
}

/**
 * List all sessions belonging to a given sprint
 * @param {string} sprint - sprint identifier
 */
async function listBySprint(sprint) {
  const sessions = await readSessions();
  return Object.entries(sessions)
    .filter(([, s]) => s.sprint === sprint)
    .map(([name, s]) => ({ name, ...s }));
}

/**
 * Get all unique sprint identifiers across all sessions
 */
async function getAllSprints() {
  const sessions = await readSessions();
  const sprints = new Set(
    Object.values(sessions)
      .map(s => s.sprint)
      .filter(Boolean)
  );
  return [...sprints].sort();
}

/**
 * Register the sprint command with the CLI program
 * @param {import('commander').Command} program
 */
function registerSprintCommand(program) {
  const sprint = program
    .command('sprint')
    .description('manage sprint associations for sessions');

  sprint
    .command('set <session> <sprint>')
    .description('assign a session to a sprint')
    .action(async (session, sprintId) => {
      try {
        await setSprint(session, sprintId);
        console.log(`Session "${session}" assigned to sprint "${sprintId}"`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  sprint
    .command('remove <session>')
    .description('remove sprint association from a session')
    .action(async (session) => {
      try {
        await removeSprint(session);
        console.log(`Sprint removed from session "${session}"`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  sprint
    .command('get <session>')
    .description('show the sprint for a session')
    .action(async (session) => {
      try {
        const sprintId = await getSprint(session);
        if (sprintId) {
          console.log(sprintId);
        } else {
          console.log(`Session "${session}" has no sprint assigned`);
        }
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  sprint
    .command('list [sprint]')
    .description('list sessions in a sprint, or list all sprints if none given')
    .action(async (sprintId) => {
      try {
        if (sprintId) {
          const sessions = await listBySprint(sprintId);
          if (sessions.length === 0) {
            console.log(`No sessions found for sprint "${sprintId}"`);
          } else {
            sessions.forEach(s => console.log(s.name));
          }
        } else {
          const sprints = await getAllSprints();
          if (sprints.length === 0) {
            console.log('No sprints defined');
          } else {
            sprints.forEach(s => console.log(s));
          }
        }
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
}

module.exports = { setSprint, removeSprint, getSprint, listBySprint, getAllSprints, registerSprintCommand };
