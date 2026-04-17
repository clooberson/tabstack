const { restoreSession } = require('./restore');
const storage = require('./storage');
const browser = require('./browser');

jest.mock('./storage');
jest.mock('./browser');

describe('restoreSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    browser.getSupportedBrowsers.mockReturnValue(['chrome', 'firefox', 'brave']);
  });

  it('throws if session not found', () => {
    storage.getSession.mockReturnValue(null);
    expect(() => restoreSession('ghost')).toThrow('Session "ghost" not found.');
  });

  it('opens urls with default browser', () => {
    storage.getSession.mockReturnValue({ name: 'work', urls: ['https://a.com', 'https://b.com'] });
    browser.openUrls.mockImplementation(() => {});
    const result = restoreSession('work');
    expect(browser.openUrls).toHaveBeenCalledWith(['https://a.com', 'https://b.com'], 'chrome');
    expect(result).toHaveLength(2);
  });

  it('respects dryRun option and does not call openUrls', () => {
    storage.getSession.mockReturnValue({ name: 'work', urls: ['https://a.com'] });
    restoreSession('work', { dryRun: true });
    expect(browser.openUrls).not.toHaveBeenCalled();
  });

  it('throws for unsupported browser', () => {
    storage.getSession.mockReturnValue({ name: 'work', urls: ['https://a.com'] });
    expect(() => restoreSession('work', { browser: 'ie' })).toThrow('Unknown browser "ie"');
  });

  it('handles session with no urls gracefully', () => {
    storage.getSession.mockReturnValue({ name: 'empty', urls: [] });
    const result = restoreSession('empty');
    expect(result).toEqual([]);
    expect(browser.openUrls).not.toHaveBeenCalled();
  });
});
