const { Command } = require('commander');
const { listTemplates, saveAsTemplate, createFromTemplate, registerTemplateCommand } = require('./cli-template-handler');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerTemplateCommand(program);
  return program;
}

describe('listTemplates', () => {
  it('returns only template sessions', () => {
    const sessions = {
      work: { urls: ['http://a.com'], isTemplate: true },
      personal: { urls: ['http://b.com'], isTemplate: false },
    };
    const result = listTemplates(sessions);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('work');
  });

  it('returns empty if no templates', () => {
    expect(listTemplates({ a: { urls: [], isTemplate: false } })).toHaveLength(0);
  });
});

describe('saveAsTemplate', () => {
  it('marks a session as template', () => {
    const sessions = { work: { urls: ['http://a.com'], isTemplate: false } };
    const result = saveAsTemplate(sessions, 'work');
    expect(result.work.isTemplate).toBe(true);
  });

  it('throws if session not found', () => {
    expect(() => saveAsTemplate({}, 'missing')).toThrow('not found');
  });
});

describe('createFromTemplate', () => {
  it('creates a new session from a template', () => {
    const sessions = { tmpl: { urls: ['http://x.com'], tags: ['work'], isTemplate: true } };
    const result = createFromTemplate(sessions, 'tmpl', 'newSession');
    expect(result.newSession).toBeDefined();
    expect(result.newSession.urls).toEqual(['http://x.com']);
    expect(result.newSession.isTemplate).toBe(false);
  });

  it('throws if template not found', () => {
    expect(() => createFromTemplate({}, 'missing', 'new')).toThrow('not found');
  });

  it('throws if source is not a template', () => {
    const sessions = { s: { urls: [], isTemplate: false } };
    expect(() => createFromTemplate(sessions, 's', 'new')).toThrow('not a template');
  });

  it('throws if destination already exists', () => {
    const sessions = {
      tmpl: { urls: [], isTemplate: true },
      existing: { urls: [], isTemplate: false },
    };
    expect(() => createFromTemplate(sessions, 'tmpl', 'existing')).toThrow('already exists');
  });
});
