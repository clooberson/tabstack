/**
 * CLI notes module - exposes notes command registration for the tabstack CLI.
 * Delegates implementation to cli-notes-handler.
 */
const { registerNotesCommand } = require('./cli-notes-handler');
module.exports = { registerNotesCommand };
