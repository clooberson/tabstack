const { diffSessionSets, formatChange } = require('./cli-watch-handler');
const { Command } = require('commander');
const { registerWatchCommand } = require('./cli-watch-handler');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerWatchCommand(program);
  return program;
}

describe('diffSessionSets', () => {
  it('detects added sessions', () => {
    const prev = {};
    const curr = { work: { urls: ['https://a.com'] } };
    const changes = diffSessionSets(prev, curr);
    expect(changes).toEqual([{ type: 'added', name: 'work' }]);
  });

  it('detects removed sessions', () => {
    const prev = { work: { urls: ['https://a.com'] } };
    const curr = {};
    const changes = diffSessionSets(prev, curr);
    expect(changes).toEqual([{ type: 'removed', name: 'work' }]);
  });

  it('detects changed sessions', () => {
    const prev = { work: { urls: ['https://a.com'] } };
    const curr = { work: { urls: ['https://a.com', 'https://b.com'] } };
    const changes = diffSessionSets(prev, curr);
    expect(changes).toEqual([{ type: 'changed', name: 'work' }]);
  });

  it('returns empty array when no changes', () => {
    const prev = { work: { urls: ['https://a.com'] } };
    const curr = { work: { urls: ['https://a.com'] } };
    const changes = diffSessionSets(prev, curr);
    expect(changes).toHaveLength(0);
  });

  it('handles multiple simultaneous changes', () => {
    const prev = { old: { urls: [] }, keep: { urls: ['https://x.com'] } };
    const curr = { keep: { urls: ['https://x.com', 'https://y.com'] }, newone: { urls: [] } };
    const changes = diffSessionSets(prev, curr);
    expect(changes.find(c => c.type === 'removed' && c.name === 'old')).toBeTruthy();
    expect(changes.find(c => c.type === 'added' && c.name === 'newone')).toBeTruthy();
    expect(changes.find(c => c.type === 'changed' && c.name === 'keep')).toBeTruthy();
  });
});

describe('formatChange', () => {
  it('formats added change', () => {
    expect(formatChange('added', 'work')).toContain('added');
    expect(formatChange('added', 'work')).toContain('work');
  });

  it('formats removed change', () => {
    expect(formatChange('removed', 'home')).toContain('removed');
  });

  it('formats changed change', () => {
    expect(formatChange('changed', 'dev')).toContain('changed');
  });
});

describe('registerWatchCommand', () => {
  it('registers the watch command', () => {
    const program = makeProgram();
    const cmd = program.commands.find(c => c.name() === 'watch');
    expect(cmd).toBeDefined();
  });

  it('watch command has interval option', () => {
    const program = makeProgram();
    const cmd = program.commands.find(c => c.name() === 'watch');
    const opt = cmd.options.find(o => o.long === '--interval');
    expect(opt).toBeDefined();
  });

  it('watch command has session option', () => {
    const program = makeProgram();
    const cmd = program.commands.find(c => c.name() === 'watch');
    const opt = cmd.options.find(o => o.long === '--session');
    expect(opt).toBeDefined();
  });
});
