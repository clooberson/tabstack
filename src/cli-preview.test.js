const { Command } = require('commander');
const { formatPreview, registerPreviewCommand } = require('./cli-preview-handler');
const storage = require('./storage');

jest.mock('./storage');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerPreviewCommand(program);
  return program;
}

describe('formatPreview', () => {
  it('shows session name and tab count', () => {
    const session = { name: 'work', urls: ['https://a.com', 'https://b.com'] };
    const output = formatPreview(session);
    expect(output).toContain('Session: work');
    expect(output).toContain('Tabs: 2');
    expect(output).toContain('https://a.com');
  });

  it('truncates urls beyond maxUrls', () => {
    const urls = Array.from({ length: 15 }, (_, i) => `https://site${i}.com`);
    const session = { name: 'big', urls };
    const output = formatPreview(session, { maxUrls: 5 });
    expect(output).toContain('... and 10 more');
  });

  it('shows tags if present', () => {
    const session = { name: 'tagged', urls: [], tags: ['dev', 'research'] };
    const output = formatPreview(session);
    expect(output).toContain('Tags: dev, research');
  });

  it('omits tags line if no tags', () => {
    const session = { name: 'plain', urls: [] };
    const output = formatPreview(session);
    expect(output).not.toContain('Tags:');
  });
});

describe('preview command', () => {
  it('prints preview for existing session', () => {
    storage.getSession.mockReturnValue({ name: 'work', urls: ['https://example.com'] });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['node', 'test', 'preview', 'work']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Session: work'));
    spy.mockRestore();
  });

  it('exits with error for missing session', () => {
    storage.getSession.mockReturnValue(null);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => makeProgram().parse(['node', 'test', 'preview', 'nope'])).toThrow('exit');
    expect(mockExit).toHaveBeenCalledWith(1);
    spy.mockRestore();
    mockExit.mockRestore();
  });
});
