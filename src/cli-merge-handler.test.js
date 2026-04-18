import { describe, it, expect, vi } from 'vitest';
import { Command } from 'commander';
import { registerMergeCommand } from './cli-merge-handler.js';

const mockSessions = {
  alpha: { name: 'alpha', urls: ['https://a.com', 'https://b.com'], tags: [] },
  beta:  { name: 'beta',  urls: ['https://b.com', 'https://c.com'], tags: ['work'] },
};

function makeProgram() {
  const readSessions = vi.fn().mockResolvedValue(mockSessions);
  const saveSession  = vi.fn().mockResolvedValue(undefined);
  const program = new Command();
  program.exitOverride();
  registerMergeCommand(program, { readSessions, saveSession });
  return { program, readSessions, saveSession };
}

describe('merge command', () => {
  it('saves merged session with deduped urls', async () => {
    const { program, saveSession } = makeProgram();
    await program.parseAsync(['merge', 'alpha', 'beta', '--name', 'gamma'], { from: 'user' });
    expect(saveSession).toHaveBeenCalledOnce();
    const saved = saveSession.mock.calls[0][0];
    expect(saved.name).toBe('gamma');
    expect(saved.urls).toEqual(['https://a.com', 'https://b.com', 'https://c.com']);
  });

  it('exits if a session does not exist', async () => {
    const readSessions = vi.fn().mockResolvedValue(mockSessions);
    const saveSession  = vi.fn();
    const program = new Command();
    program.exitOverride();
    registerMergeCommand(program, { readSessions, saveSession });
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      program.parseAsync(['merge', 'alpha', 'missing', '--name', 'out'], { from: 'user' })
    ).rejects.toThrow();
    mockExit.mockRestore();
  });
});
