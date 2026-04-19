const { Command } = require('commander');
const { generateShareableText, registerShareCommand } = require('./cli-share-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerShareCommand(program);
  return program;
}

const mockSession = {
  name: 'work',
  tags: ['dev'],
  urls: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://npmjs.com', title: 'npm' },
  ],
};

describe('generateShareableText', () => {
  test('plain text format', () => {
    const out = generateShareableText(mockSession, { format: 'text' });
    expect(out).toContain('Session: work');
    expect(out).toContain('https://github.com');
  });

  test('markdown format', () => {
    const out = generateShareableText(mockSession, { format: 'markdown', includeTitle: true });
    expect(out).toContain('## work');
    expect(out).toContain('[GitHub](https://github.com)');
    expect(out).toContain('Tags: dev');
  });

  test('markdown without titles', () => {
    const out = generateShareableText(mockSession, { format: 'markdown', includeTitle: false });
    expect(out).toContain('[https://github.com](https://github.com)');
  });

  test('json format', () => {
    const out = generateShareableText(mockSession, { format: 'json' });
    const parsed = JSON.parse(out);
    expect(parsed.name).toBe('work');
    expect(parsed.urls).toContain('https://github.com');
  });
});

describe('share command', () => {
  beforeEach(() => jest.clearAllMocks());

  test('prints plain text for existing session', () => {
    storage.getSession.mockReturnValue(mockSession);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['share', 'work'], { from: 'user' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('exits with error for missing session', () => {
    storage.getSession.mockReturnValue(null);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => makeProgram().parse(['share', 'nope'], { from: 'user' })).toThrow();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    spy.mockRestore();
    exit.mockRestore();
  });
});
