const { getStatus, formatStatus } = require('./cli-status-handler');
const { Command } = require('commander');
const { registerStatusCommand } = require('./cli-status-handler');

function makeSessions() {
  return {
    work: { urls: ['https://github.com', 'https://jira.com'], locked: true, archived: false, favorite: true, tags: ['dev'], note: 'work stuff' },
    personal: { urls: ['https://reddit.com'], locked: false, archived: false, favorite: false, tags: [], note: '' },
    old: { urls: ['https://example.com', 'https://test.com', 'https://foo.com'], locked: false, archived: true, favorite: false, tags: ['archive'], note: '' },
  };
}

describe('getStatus', () => {
  it('counts total sessions', () => {
    const s = getStatus(makeSessions());
    expect(s.total).toBe(3);
  });

  it('counts locked sessions', () => {
    const s = getStatus(makeSessions());
    expect(s.locked).toBe(1);
  });

  it('counts archived sessions', () => {
    const s = getStatus(makeSessions());
    expect(s.archived).toBe(1);
  });

  it('counts favorites', () => {
    const s = getStatus(makeSessions());
    expect(s.favorites).toBe(1);
  });

  it('counts sessions with tags', () => {
    const s = getStatus(makeSessions());
    expect(s.withTags).toBe(2);
  });

  it('counts sessions with notes', () => {
    const s = getStatus(makeSessions());
    expect(s.withNotes).toBe(1);
  });

  it('sums total urls', () => {
    const s = getStatus(makeSessions());
    expect(s.totalUrls).toBe(6);
  });

  it('computes average urls', () => {
    const s = getStatus(makeSessions());
    expect(s.avgUrls).toBe('2.0');
  });

  it('handles empty sessions', () => {
    const s = getStatus({});
    expect(s.total).toBe(0);
    expect(s.totalUrls).toBe(0);
    expect(s.avgUrls).toBe('0.0');
  });
});

describe('formatStatus', () => {
  it('includes session count in output', () => {
    const s = getStatus(makeSessions());
    const out = formatStatus(s);
    expect(out).toContain('Sessions:   3');
  });

  it('includes url info in output', () => {
    const s = getStatus(makeSessions());
    const out = formatStatus(s);
    expect(out).toContain('6 total');
  });
});
