const { Command } = require('commander');
const { registerFilterCommand } = require('./cli-filter-handler');

jest.mock('./storage');
const { readSessions } = require('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerFilterCommand(program);
  return program;
}

const mockSessions = {
  alpha: { urls: ['https://a.com', 'https://b.com'], tags: ['dev'], favorite: true },
  beta: { urls: ['https://x.com'], tags: ['misc'], favorite: false },
};

beforeEach(() => {
  readSessions.mockReturnValue(mockSessions);
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('filter command', () => {
  test('lists sessions with no filters', () => {
    makeProgram().parse(['filter'], { from: 'user' });
    expect(console.log).toHaveBeenCalledTimes(2);
  });

  test('filters by tag', () => {
    makeProgram().parse(['filter', '--tag', 'dev'], { from: 'user' });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('alpha'));
  });

  test('filters by min-urls', () => {
    makeProgram().parse(['filter', '--min-urls', '2'], { from: 'user' });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('alpha'));
  });

  test('shows no match message', () => {
    makeProgram().parse(['filter', '--tag', 'nope'], { from: 'user' });
    expect(console.log).toHaveBeenCalledWith('No sessions match the given filters.');
  });

  test('filters favorites', () => {
    makeProgram().parse(['filter', '--favorites'], { from: 'user' });
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('alpha'));
  });
});
