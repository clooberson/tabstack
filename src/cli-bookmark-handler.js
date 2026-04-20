const { getSession, writeSessions, readSessions } = require('./storage');

function addBookmark(sessions, name, url) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  if (!session.bookmarks) session.bookmarks = [];
  if (session.bookmarks.includes(url)) {
    throw new Error(`URL already bookmarked in "${name}"`);
  }
  if (!session.urls.includes(url)) {
    throw new Error(`URL "${url}" is not in session "${name}"`);
  }
  session.bookmarks.push(url);
  return session;
}

function removeBookmark(sessions, name, url) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  if (!session.bookmarks || !session.bookmarks.includes(url)) {
    throw new Error(`URL "${url}" is not bookmarked in "${name}"`);
  }
  session.bookmarks = session.bookmarks.filter(b => b !== url);
  return session;
}

function listBookmarks(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  return session.bookmarks || [];
}

function registerBookmarkCommand(program) {
  const bookmark = program.command('bookmark').description('Manage bookmarked URLs within a session');

  bookmark
    .command('add <session> <url>')
    .description('Bookmark a URL in a session')
    .action((name, url) => {
      const sessions = readSessions();
      addBookmark(sessions, name, url);
      writeSessions(sessions);
      console.log(`Bookmarked "${url}" in session "${name}"`);
    });

  bookmark
    .command('remove <session> <url>')
    .description('Remove a bookmark from a session')
    .action((name, url) => {
      const sessions = readSessions();
      removeBookmark(sessions, name, url);
      writeSessions(sessions);
      console.log(`Removed bookmark "${url}" from session "${name}"`);
    });

  bookmark
    .command('list <session>')
    .description('List all bookmarks in a session')
    .action((name) => {
      const sessions = readSessions();
      const bookmarks = listBookmarks(sessions, name);
      if (bookmarks.length === 0) {
        console.log(`No bookmarks in session "${name}"`);
      } else {
        console.log(`Bookmarks in "${name}":`);
        bookmarks.forEach((b, i) => console.log(`  ${i + 1}. ${b}`));
      }
    });
}

module.exports = { addBookmark, removeBookmark, listBookmarks, registerBookmarkCommand };
