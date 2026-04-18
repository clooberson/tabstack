import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerTrimCommand } from './cli-trim.js';

vi.mock('./storage.js', () => ({
  readSessions: vi.fn(),
  writeSessions: vi.fn(),
}));

import { readSessions, writeSessions } from './storage.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerTrimCommand(program);
  return program;
}

beforeEach(() => {
  vi.clearAllMocks();
  writeSessions.mockResolvedValue();
});

describe('trim command', () => {
  it('trims session to max tabs', async () => {
    readSessions.mockResolvedValue({
      work: { urls: ['https://a.com', 'https://b.com', 'https://c.com'] },
    });
    const program = makeProgram();
    await program.parseAsync(['trim', 'work', '--max', '2'], { from: 'user' });
    expect(writeSessions).toHaveBeenCalledWith({
      work: { urls: ['https://a.com', 'https://b.com'] },
    });
  });

  it('does nothing if already within max', async () => {
    readSessions.mockResolvedValue({
      work: { urls: ['https://a.com'] },
    });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['trim', 'work', '--max', '5'], { from: 'user' });
    expect(writeSessions).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No tabs removed'));
    consoleSpy.mockRestore();
  });

  it('dry run shows what would be removed', async () => {
    readSessions.mockResolvedValue({
      work: { urls: ['https://a.com', 'https://b.com', 'https://c.com'] },
    });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['trim', 'work', '--max', '1', '--dry-run'], { from: 'user' });
    expect(writeSessions).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Would remove 2'));
    consoleSpy.mockRestore();
  });

  it('exits with error if session not found', async () => {
    readSessions.mockResolvedValue({});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const program = makeProgram();
    await expect(program.parseAsync(['trim', 'missing', '--max', '2'], { from: 'user' })).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
