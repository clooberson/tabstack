/**
 * cli-workflow-handler.js
 * Defines and runs named workflows — sequences of tabstack commands
 * applied to sessions in order (e.g. tag + pin + archive).
 */

const { readSessions, writeSessions } = require('./storage');

/**
 * Built-in workflow definitions.
 * Each workflow is an array of step functions that receive and return a session.
 */
const BUILT_IN_WORKFLOWS = {
  'archive-old': [
    (session) => {
      const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
      if (session.createdAt && new Date(session.createdAt).getTime() < cutoff) {
        return { ...session, archived: true };
      }
      return session;
    },
  ],
  'pin-favorites': [
    (session) => {
      if (session.favorite) {
        return { ...session, pinned: true };
      }
      return session;
    },
  ],
  'clean': [
    (session) => ({ ...session, notes: undefined, reminders: undefined }),
    (session) => ({
      ...session,
      urls: [...new Set(session.urls)],
    }),
  ],
};

/**
 * List available workflow names (built-in + user-defined stored in sessions meta).
 * @param {object} sessions - sessions store
 * @returns {string[]}
 */
function listWorkflows(sessions) {
  const userDefined = Object.keys(sessions._workflows || {});
  return [...Object.keys(BUILT_IN_WORKFLOWS), ...userDefined];
}

/**
 * Run a named workflow against a specific session.
 * @param {string} name - session name
 * @param {string} workflowName - workflow to apply
 * @param {object} sessions - sessions store
 * @returns {{ session: object, changed: boolean }}
 */
function runWorkflow(name, workflowName, sessions) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found.`);

  const steps =
    BUILT_IN_WORKFLOWS[workflowName] ||
    (sessions._workflows && sessions._workflows[workflowName]);

  if (!steps) throw new Error(`Workflow "${workflowName}" not found.`);

  let updated = { ...session };
  for (const step of steps) {
    updated = step(updated);
  }

  const changed = JSON.stringify(updated) !== JSON.stringify(session);
  return { session: updated, changed };
}

/**
 * Register the `workflow` command with the CLI program.
 * @param {import('commander').Command} program
 */
function registerWorkflowCommand(program) {
  const workflow = program
    .command('workflow')
    .description('run or list named workflows on sessions');

  workflow
    .command('list')
    .description('list available workflows')
    .action(() => {
      const sessions = readSessions();
      const names = listWorkflows(sessions);
      if (names.length === 0) {
        console.log('No workflows available.');
        return;
      }
      console.log('Available workflows:');
      names.forEach((n) => console.log(`  ${n}`));
    });

  workflow
    .command('run <workflow> <session>')
    .description('apply a workflow to a session')
    .option('--dry-run', 'preview changes without saving')
    .action((workflowName, sessionName, opts) => {
      const sessions = readSessions();
      let result;
      try {
        result = runWorkflow(sessionName, workflowName, sessions);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }

      if (!result.changed) {
        console.log(`No changes made to "${sessionName}" by workflow "${workflowName}".`);
        return;
      }

      if (opts.dryRun) {
        console.log(`[dry-run] Workflow "${workflowName}" would update "${sessionName}":`);
        console.log(JSON.stringify(result.session, null, 2));
        return;
      }

      sessions[sessionName] = result.session;
      writeSessions(sessions);
      console.log(`Workflow "${workflowName}" applied to "${sessionName}".`);
    });
}

module.exports = { listWorkflows, runWorkflow, registerWorkflowCommand };
