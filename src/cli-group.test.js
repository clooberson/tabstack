const { Command } = require('commander');
const { groupSessionsByTag, registerGroupCommand } = require('./cli-group-handler');

function makeProgram(sessions) {
  jest.mock('./storage', () => ({
    readSessions: () => sessions,
    writeSessions: jest.fn(),
  }));
  const program = new Command();
  program.exitOverride();
  registerGroupCommand(program);
  return program;
}

describe('groupSessionsByTag', () => {
  it('groups sessions by tag', () => {
    const sessions = {
      work: { urls: ['http://a.com'], tags: ['work'] },
      fun: { urls: ['http://b.com'], tags: ['personal'] },
      mixed: { urls: ['http://c.com'], tags: ['work', 'personal'] },
    };
    const groups = groupSessionsByTag(sessions);
    expect(groups['work']).toContain('work');
    expect(groups['work']).toContain('mixed');
    expect(groups['personal']).toContain('fun');
    expect(groups['personal']).toContain('mixed');
  });

  it('puts untagged sessions under (untagged)', () => {
    const sessions = {
      bare: { urls: ['http://x.com'], tags: [] },
    };
    const groups = groupSessionsByTag(sessions);
    expect(groups['(untagged)']).toContain('bare');
  });

  it('handles missing tags field', () => {
    const sessions = {
      notags: { urls: ['http://y.com'] },
    };
    const groups = groupSessionsByTag(sessions);
    expect(groups['(untagged)']).toContain('notags');
  });
});

describe('group command', () => {
  let spy;
  beforeEach(() => { spy = jest.spyOn(console, 'log').mockImplementation(() => {}); });
  afterEach(() => { spy.mockRestore(); jest.resetModules(); });

  it('outputs json when --json flag is set', () => {
    const sessions = {
      s1: { urls: ['http://a.com'], tags: ['dev'] },
    };
    const program = makeProgram(sessions);
    program.parse(['node', 'cli-group', 'group', '--json']);
    const output = JSON.parse(spy.mock.calls[0][0]);
    expect(output['dev']).toContain('s1');
  });
});
