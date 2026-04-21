import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Command } from 'commander';
import { registerStatusCommand } from './cli-status-handler.js';

vi.mock('./storage.js');

import { readSessions } from './storage.js';

function makeProgram(sessions) {
  readSessions.mockResolvedValue(sessions);
  const program = new Command();
  program.exitOverride();
  registerStatusCommand(program);
  return program;
}

describe('status command integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reports zero sessions when storage is empty', async () => {
    const program = makeProgram([]);
    const logs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));

    await program.parseAsync(['node', 'tabstack', 'status']);

    const output = logs.join('\n');
    expect(output).toMatch(/0/);
  });

  it('counts total sessions correctly', async () => {
    const sessions = [
      { name: 'work', urls: ['https://github.com', 'https://jira.com'], tags: [], createdAt: new Date().toISOString() },
      { name: 'personal', urls: ['https://reddit.com'], tags: [], createdAt: new Date().toISOString() },
    ];
    const program = makeProgram(sessions);
    const logs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));

    await program.parseAsync(['node', 'tabstack', 'status']);

    const output = logs.join('\n');
    expect(output).toMatch(/2/);
  });

  it('counts total urls across all sessions', async () => {
    const sessions = [
      { name: 'work', urls: ['https://github.com', 'https://jira.com'], tags: [], createdAt: new Date().toISOString() },
      { name: 'personal', urls: ['https://reddit.com'], tags: [], createdAt: new Date().toISOString() },
    ];
    const program = makeProgram(sessions);
    const logs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));

    await program.parseAsync(['node', 'tabstack', 'status']);

    const output = logs.join('\n');
    // 3 total URLs across 2 sessions
    expect(output).toMatch(/3/);
  });

  it('shows locked session count when some are locked', async () => {
    const sessions = [
      { name: 'work', urls: ['https://github.com'], tags: [], locked: true, createdAt: new Date().toISOString() },
      { name: 'personal', urls: ['https://reddit.com'], tags: [], locked: false, createdAt: new Date().toISOString() },
    ];
    const program = makeProgram(sessions);
    const logs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));

    await program.parseAsync(['node', 'tabstack', 'status']);

    const output = logs.join('\n');
    expect(output).toMatch(/locked/i);
    expect(output).toMatch(/1/);
  });

  it('shows favorite count when some are favorited', async () => {
    const sessions = [
      { name: 'work', urls: ['https://github.com'], tags: [], favorite: true, createdAt: new Date().toISOString() },
      { name: 'personal', urls: ['https://reddit.com'], tags: [], favorite: true, createdAt: new Date().toISOString() },
      { name: 'misc', urls: ['https://news.ycombinator.com'], tags: [], createdAt: new Date().toISOString() },
    ];
    const program = makeProgram(sessions);
    const logs = [];
    vi.spyOn(console, 'log').mockImplementation((...args) => logs.push(args.join(' ')));

    await program.parseAsync(['node', 'tabstack', 'status']);

    const output = logs.join('\n');
    expect(output).toMatch(/favorit/i);
    expect(output).toMatch(/2/);
  });
});
