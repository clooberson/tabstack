import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerDedupeCommand } from './cli-dedupe.js';

vi.mock('./storage.js', () => ({
  getSession: vi.fn(),
  saveSession: vi.fn(),
}));

import { getSession, saveSession } from './storage.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerDedupeCommand(program);
  return program;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('dedupe command', () => {
  it('reports no duplicates when all urls are unique', async () => {
    getSession.mockResolvedValue({ urls: ['https://a.com', 'https://b.com'] });
    const program = makeProgram();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'test', 'dedupe', 'work']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No duplicates'));
    spy.mockRestore();
  });

  it('removes duplicates and saves session', async () => {
    getSession.mockResolvedValue({ urls: ['https://a.com', 'https://a.com', 'https://b.com'] });
    saveSession.mockResolvedValue();
    const program = makeProgram();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'test', 'dedupe', 'work']);
    expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ urls: ['https://a.com', 'https://b.com'] }));
    spy.mockRestore();
  });

  it('does not save on dry run', async () => {
    getSession.mockResolvedValue({ urls: ['https://a.com', 'https://a.com'] });
    const program = makeProgram();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await program.parseAsync(['node', 'test', 'dedupe', 'work', '--dry-run']);
    expect(saveSession).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('exits with error if session not found', async () => {
    getSession.mockResolvedValue(null);
    const program = makeProgram();
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(program.parseAsync(['node', 'test', 'dedupe', 'missing'])).rejects.toThrow('exit');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    spy.mockRestore();
    exit.mockRestore();
  });
});
