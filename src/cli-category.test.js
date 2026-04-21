const { Command } = require('commander');
const { registerCategoryCommand } = require('./cli-category-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerCategoryCommand(program);
  return program;
}

const baseSessions = {
  alpha: { urls: ['https://a.com'], category: 'dev' },
  beta: { urls: ['https://b.com'] },
};

beforeEach(() => {
  storage.readSessions = jest.fn().mockResolvedValue(JSON.parse(JSON.stringify(baseSessions)));
  storage.writeSessions = jest.fn().mockResolvedValue();
});

describe('category set', () => {
  it('sets a category and writes sessions', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'category', 'set', 'beta', 'personal']);
    expect(storage.writeSessions).toHaveBeenCalledWith(
      expect.objectContaining({ beta: expect.objectContaining({ category: 'personal' }) })
    );
  });
});

describe('category remove', () => {
  it('removes category and writes sessions', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'category', 'remove', 'alpha']);
    const written = storage.writeSessions.mock.calls[0][0];
    expect(written.alpha.category).toBeUndefined();
  });
});

describe('category list', () => {
  it('lists all categories when no arg given', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'category', 'list']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('dev'));
    spy.mockRestore();
  });

  it('lists sessions in given category', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'category', 'list', 'dev']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('alpha'));
    spy.mockRestore();
  });

  it('shows message when category has no sessions', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'category', 'list', 'nope']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No sessions'));
    spy.mockRestore();
  });
});
