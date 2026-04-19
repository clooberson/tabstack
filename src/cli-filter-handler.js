const { readSessions } = require('./storage');

function filterSessions(sessions, { tag, minUrls, maxUrls, search, favorites }) {
  let results = Object.entries(sessions);

  if (tag) {
    results = results.filter(([, s]) => Array.isArray(s.tags) && s.tags.includes(tag));
  }

  if (favorites) {
    results = results.filter(([, s]) => s.favorite === true);
  }

  if (minUrls !== undefined) {
    results = results.filter(([, s]) => Array.isArray(s.urls) && s.urls.length >= minUrls);
  }

  if (maxUrls !== undefined) {
    results = results.filter(([, s]) => Array.isArray(s.urls) && s.urls.length <= maxUrls);
  }

  if (search) {
    const lower = search.toLowerCase();
    results = results.filter(([name, s]) =>
      name.toLowerCase().includes(lower) ||
      (Array.isArray(s.urls) && s.urls.some(u => u.toLowerCase().includes(lower)))
    );
  }

  return Object.fromEntries(results);
}

function registerFilterCommand(program) {
  program
    .command('filter')
    .description('filter sessions by tag, url count, or keyword')
    .option('-t, --tag <tag>', 'filter by tag')
    .option('--min-urls <n>', 'minimum number of urls', (v) => parseInt(v, 10))
    .option('--max-urls <n>', 'maximum number of urls', (v) => parseInt(v, 10))
    .option('-s, --search <keyword>', 'search in session name or urls')
    .option('-f, --favorites', 'only show favorites')
    .action((opts) => {
      const sessions = readSessions();
      const filtered = filterSessions(sessions, {
        tag: opts.tag,
        minUrls: opts.minUrls,
        maxUrls: opts.maxUrls,
        search: opts.search,
        favorites: opts.favorites,
      });
      const names = Object.keys(filtered);
      if (names.length === 0) {
        console.log('No sessions match the given filters.');
      } else {
        names.forEach(name => {
          const s = filtered[name];
          const urlCount = Array.isArray(s.urls) ? s.urls.length : 0;
          console.log(`${name} (${urlCount} url${urlCount !== 1 ? 's' : ''})`);
        });
      }
    });
}

module.exports = { filterSessions, registerFilterCommand };
