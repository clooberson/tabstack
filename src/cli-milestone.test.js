const { Command } = require('commander');
const { registerMilestoneCommand } = require('./cli-milestone-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerMilestoneCommand(program);
  return program;
}

const baseSessions = () => ({
  work: { urls: ['https://work.com'], milestone: 'Q1' },
  personal: { urls: ['https://personal.com'] },
});

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  storage.readSessions.mockResolvedValue(baseSessions());
  storage.writeSessions.mockResolvedValue();
});

afterEach(() => jest.restoreAllMocks());

describe('milestone set', () => {
  it('sets milestone and writes sessions', async () => {
    await makeProgram().parseAsync(['milestone', 'set', 'personal', 'Q2'], { from: 'user' });
    expect(storage.writeSessions).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Q2'));
  });
});

describe('milestone remove', () => {
  it('removes milestone and writes sessions', async () => {
    await makeProgram().parseAsync(['milestone', 'remove', 'work'], { from: 'user' });
    expect(storage.writeSessions).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('removed'));
  });
});

describe('milestone get', () => {
  it('prints milestone for session', async () => {
    await makeProgram().parseAsync(['milestone', 'get', 'work'], { from: 'user' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Q1'));
  });

  it('prints no milestone when unset', async () => {
    await makeProgram().parseAsync(['milestone', 'get', 'personal'], { from: 'user' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No milestone'));
  });
});

describe('milestone list', () => {
  it('lists sessions for a given milestone', async () => {
    await makeProgram().parseAsync(['milestone', 'list', 'Q1'], { from: 'user' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('work'));
  });

  it('lists all milestones when no arg given', async () => {
    await makeProgram().parseAsync(['milestone', 'list'], { from: 'user' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Q1'));
  });

  it('reports no sessions when milestone has no matches', async () => {
    await makeProgram().parseAsync(['milestone', 'list', 'Q9'], { from: 'user' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No sessions'));
  });
});
