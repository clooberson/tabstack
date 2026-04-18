import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import fs from 'fs';
import { registerExportCommand } from './cli-export.js';
import * as storage from './storage.js';
import * as storageMutations from './storage-mutations.js';

vi.mock('./storage.js');
vi.mock('./storage-mutations.js');
vi.mock('fs');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerExportCommand(program);
  return program;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('export command', () => {
  it('exports a single session by name', async () => {
    storage.getSession.mockReturnValue({ urls: ['https://example.com'], createdAt: '2024-01-01' });
    fs.writeFileSync.mockImplementation(() => {});

    const program = makeProgram();
    program.parse(['export', 'work', '-o', 'out.json'], { from: 'user' });

    expect(storage.getSession).toHaveBeenCalledWith('work');
    expect(fs.writeFileSync).toHaveBeenCalled();
    const written = fs.writeFileSync.mock.calls[0][1];
    expect(JSON.parse(written)).toHaveProperty('work');
  });

  it('exports all sessions when --all flag is used', async () => {
    storageMutations.listSessions.mockReturnValue([{ name: 'work' }, { name: 'personal' }]);
    storage.getSession.mockImplementation((name) => ({ urls: [], name }));
    fs.writeFileSync.mockImplementation(() => {});

    const program = makeProgram();
    program.parse(['export', '--all'], { from: 'user' });

    expect(storageMutations.listSessions).toHaveBeenCalled();
    expect(storage.getSession).toHaveBeenCalledTimes(2);
    const written = fs.writeFileSync.mock.calls[0][1];
    const parsed = JSON.parse(written);
    expect(parsed).toHaveProperty('work');
    expect(parsed).toHaveProperty('personal');
  });

  it('errors when session not found', async () => {
    storage.getSession.mockReturnValue(null);
    const program = makeProgram();
    expect(() =>
      program.parse(['export', 'ghost'], { from: 'user' })
    ).toThrow();
  });
});
