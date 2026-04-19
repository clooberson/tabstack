const { getSession } = require('./storage');

function generateShareableText(session, options = {}) {
  const { format = 'text', includeTitle = true } = options;
  const urls = session.urls || [];

  if (format === 'markdown') {
    const lines = [`## ${session.name}\n`];
    if (session.tags && session.tags.length) {
      lines.push(`**Tags:** ${session.tags.join(', ')}\n`);
    }
    urls.forEach((url, i) => {
      const label = includeTitle && url.title ? url.title : url.url || url;
      const href = url.url || url;
      lines.push(`${i + 1}. [${label}](${href})`);
    });
    return lines.join('\n');
  }

  if (format === 'json') {
    return JSON.stringify({ name: session.name, urls: urls.map(u => u.url || u) }, null, 2);
  }

  // plain text default
  const lines = [`Session: ${session.name}`, ''];
  urls.forEach((url, i) => {
    lines.push(`${i + 1}. ${url.url || url}`);
  });
  return lines.join('\n');
}

function registerShareCommand(program) {
  program
    .command('share <name>')
    .description('output a session in a shareable format')
    .option('-f, --format <format>', 'output format: text, markdown, json', 'text')
    .option('--no-title', 'omit page titles in markdown output')
    .action((name, options) => {
      const session = getSession(name);
      if (!session) {
        console.error(`Session "${name}" not found.`);
        process.exit(1);
      }
      const output = generateShareableText(session, {
        format: options.format,
        includeTitle: options.title !== false,
      });
      console.log(output);
    });
}

module.exports = { generateShareableText, registerShareCommand };
