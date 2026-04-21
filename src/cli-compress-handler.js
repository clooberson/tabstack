const { readSessions, writeSessions } = require('./storage');

function compressSession(session) {
  const seen = new Set();
  const uniqueUrls = session.urls.filter(url => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
  return { ...session, urls: uniqueUrls, compressed: true, compressedAt: new Date().toISOString() };
}

function compressAll(sessions) {
  return sessions.map(compressSession);
}

function registerCompressCommand(program) {
  program
    .command('compress [name]')
    .description('Remove duplicate URLs from a session or all sessions')
    .option('--all', 'Compress all sessions')
    .action((name, opts) => {
      const sessions = readSessions();

      if (opts.all) {
        const compressed = compressAll(sessions);
        const totalRemoved = sessions.reduce((acc, s, i) => {
          return acc + (s.urls.length - compressed[i].urls.length);
        }, 0);
        writeSessions(compressed);
        console.log(`Compressed all sessions. Removed ${totalRemoved} duplicate URL(s).`);
        return;
      }

      if (!name) {
        console.error('Please provide a session name or use --all');
        process.exit(1);
      }

      const idx = sessions.findIndex(s => s.name === name);
      if (idx === -1) {
        console.error(`Session "${name}" not found.`);
        process.exit(1);
      }

      const original = sessions[idx];
      const compressed = compressSession(original);
      const removed = original.urls.length - compressed.urls.length;
      sessions[idx] = compressed;
      writeSessions(sessions);
      console.log(`Compressed "${name}". Removed ${removed} duplicate URL(s). ${compressed.urls.length} URL(s) remaining.`);
    });
}

module.exports = { compressSession, compressAll, registerCompressCommand };
