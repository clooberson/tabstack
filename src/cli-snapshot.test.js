import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerSnapshotCommand, createSnapshotName } from './cli-snapshot-handler.js';

vi.mock('./storage.js', () => ({
  readSessions: vi.fn(),
  saveSession: vi.fn(),
}));

import { readSessions, saveSession } from './storage.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSnapshotCommand(program);
  return program;
}

describe('createSnapshotName', () => {
  it('includes base name and snapshot label', () => {
    const name = createSnapshotName('work');
    expect(name).toMatch(/^work-snapshot-/);
  });
});

describe('snapshot command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a snapshot of an existing session', async () => {
    readSessions.mockResolvedValue({
      work: { urls: ['https://a.com', 'https://b.com'], tags: ['dev'] },
    });
    saveSession.mockResolvedValue();

    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'snapshot', 'work', '--name', 'work-backup']);

    expect(saveSession).toHaveBeenCalledWith('work-backup', expect.objectContaining({
      urls: ['https://a.com', 'https://b.com'],
      snapshotOf: 'work',
    }));
  });

  it('errors if session does not exist', async () => {
    readSessions.mockResolvedValue({});
    const program = makeProgram();
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(
      program.parseAsync(['node', 'test', 'snapshot', 'missing'])
    ).rejects.toThrow();

    exitSpy.mockRestore();
  });

  it('errors if snapshot name already exists', async () => {
    readSessions.mockResolvedValue({
      work: { urls: ['https://a.com'], tags: [] },
      'work-backup': { urls: [], tags: [] },
    });
    const program = makeProgram();
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(
      program.parseAsync(['node', 'test', 'snapshot', 'work', '--name', 'work-backup'])
    ).rejects.toThrow();

    exitSpy.mockRestore();
  });
});
