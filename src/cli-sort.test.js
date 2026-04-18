import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerSortCommand } from './cli-sort.js';

vi.mock('./storage.js', () => ({
  readSessions: vi.fn(),
  writeSessions: vi.fn(),
}));

import { readSessions, writeSessions } from './storage.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSortCommand(program);
  return program;
}

beforeEach(() => {
  vi.clearAllMocks();
  writeSessions.mockResolvedValue(undefined);
});

describe('sort command', () => {
  it('sorts tabs by url by default', async () => {
    readSessions.mockResolvedValue({
      work: { urls: ['https://z.com', 'https://a.com', 'https://m.com'] }
    });

    await makeProgram().parseAsync(['node', 'test', 'sort', 'work']);

    const saved = writeSessions.mock.calls[0][0];
    expect(saved.work.urls).toEqual(['https://a.com', 'https://m.com', 'https://z.com']);
  });

  it('sorts in reverse when --reverse flag is set', async () => {
    readSessions.mockResolvedValue({
      work: { urls: ['https://a.com', 'https://z.com', 'https://m.com'] }
    });

    await makeProgram().parseAsync(['node', 'test', 'sort', 'work', '--reverse']);

    const saved = writeSessions.mock.calls[0][0];
    expect(saved.work.urls[0]).toBe('https://z.com');
  });

  it('errors if session not found', async () => {
    readSessions.mockResolvedValue({});
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(makeProgram().parseAsync(['node', 'test', 'sort', 'nope'])).rejects.toThrow();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('not found'));

    spy.mockRestore();
    exitSpy.mockRestore();
  });

  it('errors on invalid sort field', async () => {
    readSessions.mockResolvedValue({ work: { urls: [] } });
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(makeProgram().parseAsync(['node', 'test', 'sort', 'work', '--by', 'date'])).rejects.toThrow();
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('invalid sort field'));

    spy.mockRestore();
    exitSpy.mockRestore();
  });
});
