const { readSessions } = require('./storage');

function getVersionInfo(sessions) {
  const pkg = require('../package.json');
  const sessionCount = Object.keys(sessions).length;
  const totalUrls = Object.values(sessions).reduce(
    (sum, s) => sum + (s.urls ? s.urls.length : 0),
    0
  );
  return {
    version: pkg.version,
    name: pkg.name,
    sessionCount,
    totalUrls,
  };
}

function formatVersionOutput(info, verbose) {
  if (!verbose) {
    return `${info.name} v${info.version}`;
  }
  return [
    `${info.name} v${info.version}`,
    `Sessions stored: ${info.sessionCount}`,
    `Total URLs tracked: ${info.totalUrls}`,
    `Node: ${process.version}`,
    `Platform: ${process.platform}`,
  ].join('\n');
}

function registerVersionCommand(program) {
  program
    .command('version')
    .description('show version information')
    .option('-v, --verbose', 'show extended version info')
    .action((opts) => {
      const sessions = readSessions();
      const info = getVersionInfo(sessions);
      console.log(formatVersionOutput(info, opts.verbose));
    });
}

module.exports = { getVersionInfo, formatVersionOutput, registerVersionCommand };
