import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { mergeSessionsIntoNew } from './cli-merge-handler.js';

const sessions = {
  work: { name: 'work', urls: ['https://github.com', 'https://slack.com'], tags: ['dev'] },
  personal: { name: 'personal', urls: ['https://gmail.com', 'https://github.com'], tags: ['misc'] },
};

describe('mergeSessionsIntoNew', () => {
  it('merges urls from multiple sessions deduped', () => {
    const result = mergeSessionsIntoNew(['work', 'personal'], 'combined', sessions);
    expect(result.name).toBe('combined');
    expect(result.urls).toEqual(['https://github.com', 'https://slack.com', 'https://gmail.com']);
  });

  it('merges tags from all sessions', () => {
    const result = mergeSessionsIntoNew(['work', 'personal'], 'combined', sessions);
    expect(result.tags).toContain('dev');
    expect(result.tags).toContain('misc');
  });

  it('throws if session not found', () => {
    expect(() => mergeSessionsIntoNew(['missing'], 'out', sessions)).toThrow('Session not found: missing');
  });

  it('includes createdAt', () => {
    const result = mergeSessionsIntoNew(['work'], 'out', sessions);
    expect(result.createdAt).toBeTruthy();
  });
});

function makeProgram(readSessions, saveSession) {
  const program = new Command();
  program.exitOverride();
  // dynamic import mock not feasible here; test handler logic directly
  return program;
}

export { makeProgram };
