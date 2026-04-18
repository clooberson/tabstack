import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerStatsCommand } from './cli-stats-handler.js';
import * as storage from './storage.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerStatsCommand(program);
  return program;
}

describe('stats command', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('prints no sessions message when empty', () => {
    vi.spyOn(storage, 'readSessions').mockReturnValue({});
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['stats'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No sessions saved yet.');
  });

  it('prints stats for sessions', () => {
    vi.spyOn(storage, 'readSessions').mockReturnValue({
      work: { urls: ['https://a.com', 'https://b.com'], tags: ['work'] },
      personal: { urls: ['https://c.com'], tags: ['fun', 'work'] },
    });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['stats'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('Sessions:     2');
    expect(spy).toHaveBeenCalledWith('Total URLs:   3');
    expect(spy).toHaveBeenCalledWith('Avg URLs:     1.5');
    expect(spy).toHaveBeenCalledWith('Unique tags:  2');
    expect(spy).toHaveBeenCalledWith('Largest:      work (2 URLs)');
  });

  it('handles sessions with no tags', () => {
    vi.spyOn(storage, 'readSessions').mockReturnValue({
      solo: { urls: ['https://x.com'] },
    });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['stats'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('Unique tags:  0');
  });
});
