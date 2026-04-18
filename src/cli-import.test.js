import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerImportCommand } from './cli-import.js';
import * as storage from './storage.js';
import * as fs from 'fs';

vi.mock('./storage.js');
vi.mock('fs');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerImportCommand(program);
  return program;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('import command', () => {
  it('imports sessions from a valid JSON file', () => {
    const sessions = [
      { name: 'work', urls: ['https://github.com', 'https://jira.com'] },
      { name: 'news', urls: ['https://hn.com'] },
    ];
    fs.readFileSync.mockReturnValue(JSON.stringify(sessions));
    storage.saveSession.mockImplementation(() => {});

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['import', 'sessions.json'], { from: 'user' });

    expect(storage.saveSession).toHaveBeenCalledTimes(2);
    expect(storage.saveSession).toHaveBeenCalledWith('work', sessions[0].urls, { overwrite: undefined });
    consoleSpy.mockRestore();
  });

  it('exits if file not found', () => {
    const err = new Error('not found');
    err.code = 'ENOENT';
    fs.readFileSync.mockImplementation(() => { throw err; });

    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => makeProgram().parse(['import', 'missing.json'], { from: 'user' })).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it('skips sessions with missing name or urls', () => {
    const sessions = [{ name: 'bad' }, { urls: ['https://x.com'] }, { name: 'ok', urls: ['https://ok.com'] }];
    fs.readFileSync.mockReturnValue(JSON.stringify(sessions));
    storage.saveSession.mockImplementation(() => {});

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    makeProgram().parse(['import', 'sessions.json'], { from: 'user' });

    expect(storage.saveSession).toHaveBeenCalledTimes(1);
    consoleSpy.mockRestore();
  });
});
