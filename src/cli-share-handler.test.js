const { generateShareableText } = require('./cli-share-handler');

describe('generateShareableText edge cases', () => {
  test('handles session with plain url strings', () => {
    const session = { name: 'simple', urls: ['https://example.com'] };
    const out = generateShareableText(session, { format: 'text' });
    expect(out).toContain('https://example.com');
  });

  test('handles empty urls array', () => {
    const session = { name: 'empty', urls: [] };
    const out = generateShareableText(session, { format: 'markdown' });
    expect(out).toContain('## empty');
  });

  test('markdown skips tags line when no tags', () => {
    const session = { name: 'notags', urls: [{ url: 'https://a.com', title: 'A' }] };
    const out = generateShareableText(session, { format: 'markdown' });
    expect(out).not.toContain('Tags:');
  });

  test('json includes all urls', () => {
    const session = {
      name: 'multi',
      urls: ['https://one.com', 'https://two.com'],
    };
    const out = generateShareableText(session, { format: 'json' });
    const parsed = JSON.parse(out);
    expect(parsed.urls).toHaveLength(2);
  });

  test('defaults to text format', () => {
    const session = { name: 'def', urls: [{ url: 'https://x.com', title: 'X' }] };
    const out = generateShareableText(session);
    expect(out).toContain('Session: def');
  });
});
