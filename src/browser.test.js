const { getSupportedBrowsers, getPlatform } = require('./browser');

describe('browser', () => {
  describe('getSupportedBrowsers', () => {
    it('returns an array of browser names', () => {
      const browsers = getSupportedBrowsers();
      expect(Array.isArray(browsers)).toBe(true);
      expect(browsers).toContain('chrome');
      expect(browsers).toContain('firefox');
      expect(browsers).toContain('brave');
    });
  });

  describe('getPlatform', () => {
    it('returns a known platform string', () => {
      const platform = getPlatform();
      expect(['mac', 'linux', 'win']).toContain(platform);
    });
  });

  describe('openUrls', () => {
    it('throws for unsupported browser', () => {
      const { openUrls } = require('./browser');
      expect(() => openUrls(['https://example.com'], 'netscape')).toThrow(
        'Unsupported browser: netscape'
      );
    });
  });
});
