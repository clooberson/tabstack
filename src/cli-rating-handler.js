const { readSessions, writeSessions } = require('./storage');

const VALID_RATINGS = [1, 2, 3, 4, 5];

function setRating(sessions, name, rating) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  const num = parseInt(rating, 10);
  if (!VALID_RATINGS.includes(num)) {
    throw new Error(`Rating must be between 1 and 5`);
  }
  session.rating = num;
  return session;
}

function clearRating(sessions, name) {
  const session = sessions[name];
  if (!session) throw new Error(`Session "${name}" not found`);
  delete session.rating;
  return session;
}

function listByRating(sessions, minRating = 1) {
  return Object.entries(sessions)
    .filter(([, s]) => s.rating >= minRating)
    .sort(([, a], [, b]) => (b.rating || 0) - (a.rating || 0))
    .map(([name, s]) => ({ name, rating: s.rating, urls: s.urls }));
}

function registerRatingCommand(program) {
  const rating = program
    .command('rating')
    .description('manage session ratings');

  rating
    .command('set <name> <rating>')
    .description('set a rating (1-5) for a session')
    .action(async (name, ratingVal) => {
      const sessions = await readSessions();
      setRating(sessions, name, ratingVal);
      await writeSessions(sessions);
      console.log(`Rated "${name}": ${ratingVal}/5`);
    });

  rating
    .command('clear <name>')
    .description('remove rating from a session')
    .action(async (name) => {
      const sessions = await readSessions();
      clearRating(sessions, name);
      await writeSessions(sessions);
      console.log(`Cleared rating for "${name}"`);
    });

  rating
    .command('list')
    .description('list sessions by rating')
    .option('--min <n>', 'minimum rating', '1')
    .action(async (opts) => {
      const sessions = await readSessions();
      const results = listByRating(sessions, parseInt(opts.min, 10));
      if (!results.length) {
        console.log('No rated sessions found.');
        return;
      }
      results.forEach(({ name, rating, urls }) => {
        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
        console.log(`${stars}  ${name} (${urls.length} url${urls.length !== 1 ? 's' : ''})`);
      });
    });
}

module.exports = { setRating, clearRating, listByRating, registerRatingCommand };
