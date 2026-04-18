import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerPinCommand } from './cli-pin.js';

vi.mock('./storage.js', () => ({
  readSessions: vi.fn(),
  writeSessions: vi.fn(),
}));

import { readSessions, writeSessions } from './storage.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerPinCommand(program);
  return program;
}

beforeEach(() => {
  vi.clearAllMocks();
  writeSessions.mockResolvedValue(undefined);
});

describe('pin command', () => {
  it('pins an existing session', async () => {
    readSessions.mockResolvedValue({ work: { urls: ['https://example.com'] } });
    const program = makeProgram();
    await program.parseAsync(['node', 'tabstack', 'pin', 'work']);
    expect(writeSessions).toHaveBeenCalledWith(
      expect.objectContaining({ work: expect.objectContaining({ pinned: true }) })
    );
  });

  it('unpins a session with --unpin flag', async () => {
    readSessions.mockResolvedValue({ work: { urls: [], pinned: true } });
    const program = makeProgram();
    await program.parseAsync(['node', 'tabstack', 'pin', 'work', '--unpin']);
    const written = writeSessions.mock.calls[0][0];
    expect(written.work.pinned).toBeUndefined();
  });

  it('does not modify other sessions when pinning', async () => {
    readSessions.mockResolvedValue({
      work: { urls: ['https://example.com'] },
      personal: { urls: ['https://news.com'] },
    });
    const program = makeProgram();
    await program.parseAsync(['node', 'tabstack', 'pin', 'work']);
    const written = writeSessions.mock.calls[0][0];
    expect(written.personal).toEqual({ urls: ['https://news.com'] });
  });

  it('exits with error if session not found', async () => {
    readSessions.mockResolvedValue({});
    const program = makeProgram();
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      program.parseAsync(['node', 'tabstack', 'pin', 'missing'])
    ).rejects.toThrow('exit');
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
