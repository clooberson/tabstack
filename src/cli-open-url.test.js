import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerOpenUrlCommand } from './cli-open-url.js';

vi.mock('./browser.js', () => ({
  openUrls: vi.fn(),
  getSupportedBrowsers: vi.fn(() => ['chrome', 'firefox']),
}));

vi.mock('./restore.js', () => ({
  validateBrowser: vi.fn(() => null),
  restoreSession: vi.fn(),
}));

import { openUrls } from './browser.js';
import { validateBrowser } from './restore.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerOpenUrlCommand(program);
  return program;
}

describe('open-url command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    openUrls.mockResolvedValue();
  });

  it('opens valid urls', async () => {
    const program = makeProgram();
    await program.parseAsync(['open-url', 'https://example.com', 'https://foo.com'], { from: 'user' });
    expect(openUrls).toHaveBeenCalledWith(['https://example.com', 'https://foo.com'], null);
  });

  it('passes browser option', async () => {
    const program = makeProgram();
    await program.parseAsync(['open-url', 'https://example.com', '--browser', 'firefox'], { from: 'user' });
    expect(validateBrowser).toHaveBeenCalledWith('firefox');
    expect(openUrls).toHaveBeenCalledWith(['https://example.com'], 'firefox');
  });

  it('exits on invalid browser', async () => {
    validateBrowser.mockReturnValue('unsupported browser');
    const program = makeProgram();
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      program.parseAsync(['open-url', 'https://example.com', '--browser', 'safari'], { from: 'user' })
    ).rejects.toThrow('exit');
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  it('exits when no valid urls provided', async () => {
    const program = makeProgram();
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      program.parseAsync(['open-url', 'not-a-url'], { from: 'user' })
    ).rejects.toThrow('exit');
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
