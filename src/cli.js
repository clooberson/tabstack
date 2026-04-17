#!/usr/bin/env node

const { Command } = require('commander');
const { saveSession, getSession, deleteSession, listSessions } = require('./storage');

const program = new Command();

program
  .name('tabstack')
  .description('Save and restore browser tab sessions from the terminal')
  .version('0.1.0');

program
  .command('save <name> <urls...>')
  .description('Save a session with a name and one or more URLs')
  .action((name, urls) => {
    saveSession(name, urls);
    console.log(`Saved session "${name}" with ${urls.length} tab(s).`);
  });

program
  .command('restore <name>')
  .description('Print URLs for a saved session')
  .action((name) => {
    const session = getSession(name);
    if (!session) {
      console.error(`No session found with name "${name}".`);
      process.exit(1);
    }
    console.log(`Restoring session "${name}" (saved ${session.savedAt}):`);
    session.urls.forEach((url) => console.log(`  ${url}`));
  });

program
  .command('list')
  .description('List all saved sessions')
  .action(() => {
    const sessions = listSessions();
    const names = Object.keys(sessions);
    if (names.length === 0) {
      console.log('No sessions saved yet.');
      return;
    }
    names.forEach((name) => {
      const s = sessions[name];
      console.log(`  ${name} — ${s.urls.length} tab(s), saved ${s.savedAt}`);
    });
  });

program
  .command('delete <name>')
  .description('Delete a saved session')
  .action((name) => {
    const removed = deleteSession(name);
    if (!removed) {
      console.error(`No session found with name "${name}".`);
      process.exit(1);
    }
    console.log(`Deleted session "${name}".`);
  });

program.parse(process.argv);
