const { Command } = require('commander');
const { validateSession, registerValidateCommand } = require('./cli-validate-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerValidateCommand(program);
  return program;
}

describe('validateSession', () => {
  afterEach(() => jest.clearAllMocks());

  test('returns error when session not found', () => {
    storage.getSession.mockReturnValue(null);
    const result = validateSession('missing');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not found/);
  });

  test('valid session passes', () => {
    storage.getSession.mockReturnValue({
      urls: ['https://example.com', 'https://github.com'],
      createdAt: Date.now(),
    });
    const result = validateSession('work');
    expect(result.valid).toBe(true);
    expect(result.urlCount).toBe(2);
  });

  test('flags invalid url', () => {
    storage.getSession.mockReturnValue({
      urls: ['https://valid.com', 'not-a-url'],
      createdAt: Date.now(),
    });
    const result = validateSession('bad');
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes('url[1]'))).toBe(true);
  });

  test('flags empty urls array', () => {
    storage.getSession.mockReturnValue({ urls: [], createdAt: Date.now() });
    const result = validateSession('empty');
    expect(result.valid).toBe(false);
    expect(result.issues).toContain('session has no urls');
  });

  test('flags missing createdAt', () => {
    storage.getSession.mockReturnValue({ urls: ['https://example.com'] });
    const result = validateSession('nodate');
    expect(result.valid).toBe(false);
    expect(result.issues).toContain('missing createdAt timestamp');
  });
});

describe('validate command', () => {
  test('prints valid message for good session', async () => {
    storage.getSession.mockReturnValue({
      urls: ['https://example.com'],
      createdAt: Date.now(),
    });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['validate', 'work'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('valid'));
    spy.mockRestore();
  });
});
