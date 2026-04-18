import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerTagCommand } from './cli-tag.js';

vi.mock('./storage.js', () => ({
  readSessions: vi.fn(),
  writeSessions: vi.fn(),
  getSession: vi.fn(),
}));

import { readSessions, writeSessions, getSession } from './storage.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerTagCommand(program);
  return program;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('tag command', () => {
  it('adds tags to a session', () => {
    const session = { name: 'work', urls: [], tags: [] };
    readSessions.mockReturnValue({ work: session });
    getSession.mockReturnValue(session);

    const program = makeProgram();
    program.parse(['tag', 'work', 'dev', 'important'], { from: 'user' });

    expect(session.tags).toContain('dev');
    expect(session.tags).toContain('important');
    expect(writeSessions).toHaveBeenCalled();
  });

  it('removes tags with --remove flag', () => {
    const session = { name: 'work', urls: [], tags: ['dev', 'important'] };
    readSessions.mockReturnValue({ work: session });
    getSession.mockReturnValue(session);

    const program = makeProgram();
    program.parse(['tag', 'work', 'dev', '--remove'], { from: 'user' });

    expect(session.tags).not.toContain('dev');
    expect(session.tags).toContain('important');
    expect(writeSessions).toHaveBeenCalled();
  });

  it('lists tags with --list flag', () => {
    const session = { name: 'work', urls: [], tags: ['dev'] };
    readSessions.mockReturnValue({ work: session });
    getSession.mockReturnValue(session);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const program = makeProgram();
    program.parse(['tag', 'work', '--list'], { from: 'user' });

    expect(spy).toHaveBeenCalledWith(expect.stringContaining('dev'));
    expect(writeSessions).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('exits if session not found', () => {
    readSessions.mockReturnValue({});
    getSession.mockReturnValue(null);
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    const program = makeProgram();
    expect(() => program.parse(['tag', 'missing', 'foo'], { from: 'user' })).toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });
});
