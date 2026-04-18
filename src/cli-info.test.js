import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerInfoCommand } from './cli-info.js';
import * as storage from './storage.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerInfoCommand(program);
  return program;
}

vi.mock('./storage.js');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('info command', () => {
  it('prints session details', () => {
    storage.getSession.mockReturnValue({
      urls: ['https://example.com', 'https://github.com'],
      createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
      updatedAt: null,
    });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['info', 'work'], { from: 'user' });

    expect(storage.getSession).toHaveBeenCalledWith('work');
    expect(consoleSpy).toHaveBeenCalledWith('Session: work');
    expect(consoleSpy).toHaveBeenCalledWith('Tabs:    2');
    consoleSpy.mockRestore();
  });

  it('exits with error if session not found', () => {
    storage.getSession.mockReturnValue(null);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    expect(() =>
      makeProgram().parse(['info', 'missing'], { from: 'user' })
    ).toThrow('exit');

    expect(errorSpy).toHaveBeenCalledWith('Session "missing" not found.');
    expect(exitSpy).toHaveBeenCalledWith(1);
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('shows updated date when present', () => {
    storage.getSession.mockReturnValue({
      urls: ['https://example.com'],
      createdAt: new Date('2024-01-15T10:00:00Z').toISOString(),
      updatedAt: new Date('2024-01-16T12:00:00Z').toISOString(),
    });

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['info', 'work'], { from: 'user' });

    const calls = consoleSpy.mock.calls.map(c => c[0]);
    expect(calls.some(c => c.startsWith('Updated:'))).toBe(true);
    consoleSpy.mockRestore();
  });
});
