const { getSession } = require('./storage');

function formatPreview(session, { maxUrls = 10 } = {}) {
  const urls = session.urls || [];
  const shown = urls.slice(0, maxUrls);
  const remaining = urls.length - shown.length;

  const lines = [
    `Session: ${session.name}`,
    `Tabs: ${urls.length}`,
  ];

  if (session.tags && session.tags.length > 0) {
    lines.push(`Tags: ${session.tags.join(', ')}`);
  }

  if (session.createdAt) {
    lines.push(`Created: ${new Date(session.createdAt).toLocaleString()}`);
  }

  lines.push('');
  shown.forEach((url, i) => {
    lines.push(`  ${i + 1}. ${url}`);
  });

  if (remaining > 0) {
    lines.push(`  ... and ${remaining} more`);
  }

  return lines.join('\n');
}

function registerPreviewCommand(program) {
  program
    .command('preview <name>')
    .description('preview a session without restoring it')
    .option('-n, --max-urls <number>', 'max urls to show', '10')
    .action((name, options) => {
      const session = getSession(name);
      if (!session) {
        console.error(`Session "${name}" not found.`);
        process.exit(1);
      }
      const maxUrls = parseInt(options.maxUrls, 10);
      console.log(formatPreview(session, { maxUrls }));
    });
}

module.exports = { formatPreview, registerPreviewCommand };
