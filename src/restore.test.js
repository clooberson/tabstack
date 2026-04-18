jest.mock('./browser');

const { validateBrowser, restoreSession } = require('./restore');
const { openUrls, getSupportedBrowsers } = require('./browser');

describe('validateBrowser', () => {
  beforeEach(() => {
    getSupportedBrowsers.mockReturnValue(['chrome', 'firefox', 'edge']);
  });

  test('returns null for supported browser', () => {
    expect(validateBrowser('chrome')).toBeNull();
  });

  test('returns error string for unsupported browser', () => {
    const result = validateBrowser('safari');
    expect(result).toMatch(/safari/);
    expect(result).toMatch(/unsupported/i);
  });
});

describe('restoreSession', () => {
  beforeEach(() => jest.clearAllMocks());

  test('calls openUrls with session urls and browser', async () => {
    openUrls.mockResolvedValue();
    const session = { name: 'test', urls: ['https://example.com', 'https://github.com'] };
    await restoreSession(session, 'firefox');
    expect(openUrls).toHaveBeenCalledWith(['https://example.com', 'https://github.com'], 'firefox');
  });

  test('throws if session has no urls', async () => {
    const session = { name: 'empty', urls: [] };
    await expect(restoreSession(session, 'chrome')).rejects.toThrow(/no urls/i);
  });

  test('propagates openUrls errors', async () => {
    openUrls.mockRejectedValue(new Error('browser not found'));
    const session = { name: 'test', urls: ['https://a.com'] };
    await expect(restoreSession(session, 'chrome')).rejects.toThrow('browser not found');
  });
});
