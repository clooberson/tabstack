const { Command } = require('commander');
const { registerFavoriteCommand, toggleFavorite, listFavorites } = require('./cli-favorite-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerFavoriteCommand(program);
  return program;
}

const baseSessions = () => ({
  work: { urls: ['https://github.com'], favorite: false, tags: [] },
  personal: { urls: ['https://news.ycombinator.com'], favorite: true, tags: [] },
});

beforeEach(() => {
  storage.readSessions.mockReturnValue(baseSessions());
  storage.writeSessions.mockReset();
});

test('toggleFavorite sets favorite to true', () => {
  storage.readSessions.mockReturnValue(baseSessions());
  const result = toggleFavorite('work', true);
  expect(result).toBe(true);
  expect(storage.writeSessions).toHaveBeenCalled();
});

test('toggleFavorite throws for missing session', () => {
  expect(() => toggleFavorite('nope')).toThrow('not found');
});

test('listFavorites returns only favorites', () => {
  const favs = listFavorites();
  expect(favs).toHaveLength(1);
  expect(favs[0].name).toBe('personal');
});

test('favorite add command marks session', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['favorite', 'add', 'work'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('work'));
  spy.mockRestore();
});

test('favorite list command prints favorites', () => {
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['favorite', 'list'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('personal'));
  spy.mockRestore();
});

test('favorite list shows message when none', () => {
  storage.readSessions.mockReturnValue({ work: { urls: [], favorite: false, tags: [] } });
  const program = makeProgram();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  program.parse(['favorite', 'list'], { from: 'user' });
  expect(spy).toHaveBeenCalledWith('No favorite sessions');
  spy.mockRestore();
});
