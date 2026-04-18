import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerSearchCommand } from './cli-search.js';

vi.mock('./storage.js', () => ({
  readSessions: vi.fn(),
}));

import { readSessions } from './storage.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSearchCommand(program);
  return program;
}

const mockSessions = {
  work: { urls: ['https://github.com', 'https://notion.so', 'https://slack.com'] },
  personal: { urls: ['https://github.com/personal', 'https://reddit.com'] },
};

beforeEach(() => {
  vi.clearAllMocks();
  readSessions.mockResolvedValue(mockSessions);
});

describe('search command', () => {
  it('finds matching tabs across all sessions', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['search', 'github'], { from: 'user' });
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('https://github.com');
    expect(output).toContain('https://github.com/personal');
    consoleSpy.mockRestore();
  });

  it('limits search to a specific session with --session flag', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['search', 'github', '--session', 'work'], { from: 'user' });
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('https://github.com');
    expect(output).not.toContain('personal');
    consoleSpy.mockRestore();
  });

  it('shows no results message when nothing matches', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['search', 'zzznomatch'], { from: 'user' });
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('No tabs found');
    consoleSpy.mockRestore();
  });

  it('exits with error for unknown session', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      makeProgram().parseAsync(['search', 'github', '--session', 'ghost'], { from: 'user' })
    ).rejects.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
