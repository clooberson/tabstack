const { readSessions, writeSessions } = require('./storage');

function setFolder(sessions, name, folder) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  session.folder = folder;
  return sessions;
}

function removeFolder(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.folder;
  return sessions;
}

function getFolder(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.folder || null;
}

function listByFolder(sessions, folder) {
  return Object.entries(sessions)
    .filter(([, s]) => s.folder === folder)
    .map(([name]) => name);
}

function getAllFolders(sessions) {
  const folders = new Set();
  for (const s of Object.values(sessions)) {
    if (s.folder) folders.add(s.folder);
  }
  return [...folders].sort();
}

function registerFolderCommand(program) {
  const folder = program.command('folder').description('Manage session folders');

  folder
    .command('set <session> <folder>')
    .description('Assign a session to a folder')
    .action(async (name, folderName) => {
      const sessions = await readSessions();
      const updated = setFolder(sessions, name, folderName);
      await writeSessions(updated);
      console.log(`Session "${name}" assigned to folder "${folderName}"`);
    });

  folder
    .command('remove <session>')
    .description('Remove folder assignment from a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const updated = removeFolder(sessions, name);
      await writeSessions(updated);
      console.log(`Folder removed from session "${name}"`);
    });

  folder
    .command('get <session>')
    .description('Get the folder of a session')
    .action(async (name) => {
      const sessions = await readSessions();
      const f = getFolder(sessions, name);
      console.log(f ? `Folder: ${f}` : `Session "${name}" has no folder`);
    });

  folder
    .command('list [folder]')
    .description('List sessions in a folder, or list all folders')
    .action(async (folderName) => {
      const sessions = await readSessions();
      if (folderName) {
        const names = listByFolder(sessions, folderName);
        if (names.length === 0) console.log(`No sessions in folder "${folderName}"`);
        else names.forEach(n => console.log(n));
      } else {
        const folders = getAllFolders(sessions);
        if (folders.length === 0) console.log('No folders defined');
        else folders.forEach(f => console.log(f));
      }
    });
}

module.exports = { setFolder, removeFolder, getFolder, listByFolder, getAllFolders, registerFolderCommand };
