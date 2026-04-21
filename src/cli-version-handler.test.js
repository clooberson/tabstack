const { getVersionInfo, formatVersionOutput } = require('./cli-version-handler');

describe('getVersionInfo', () => {
  it('returns version from package.json', () => {
    const info = getVersionInfo({});
    expect(typeof info.version).toBe('string');
    expect(info.version.length).toBeGreaterThan(0);
  });

  it('counts sessions correctly', () => {
    const sessions = {
      work: { urls: ['https://a.com', 'https://b.com'] },
      home: { urls: ['https://c.com'] },
    };
    const info = getVersionInfo(sessions);
    expect(info.sessionCount).toBe(2);
    expect(info.totalUrls).toBe(3);
  });

  it('handles empty sessions', () => {
    const info = getVersionInfo({});
    expect(info.sessionCount).toBe(0);
    expect(info.totalUrls).toBe(0);
  });

  it('handles sessions without urls field', () => {
    const sessions = { broken: {} };
    const info = getVersionInfo(sessions);
    expect(info.totalUrls).toBe(0);
  });
});

describe('formatVersionOutput', () => {
  const info = { name: 'tabstack', version: '1.2.3', sessionCount: 5, totalUrls: 20 };

  it('returns short format when not verbose', () => {
    const out = formatVersionOutput(info, false);
    expect(out).toBe('tabstack v1.2.3');
  });

  it('returns extended info when verbose', () => {
    const out = formatVersionOutput(info, true);
    expect(out).toContain('tabstack v1.2.3');
    expect(out).toContain('Sessions stored: 5');
    expect(out).toContain('Total URLs tracked: 20');
    expect(out).toContain('Node:');
    expect(out).toContain('Platform:');
  });
});
