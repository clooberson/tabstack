const { setLabel, removeLabel, getLabel, listByLabel } = require('./cli-label-handler');

describe('label round-trip integration', () => {
  it('sets and retrieves a label', () => {
    let sessions = { mySession: { urls: ['https://example.com'] } };
    sessions = setLabel(sessions, 'mySession', 'Important');
    expect(getLabel(sessions, 'mySession')).toBe('Important');
  });

  it('sets then removes a label', () => {
    let sessions = { mySession: { urls: ['https://example.com'] } };
    sessions = setLabel(sessions, 'mySession', 'Temp');
    sessions = removeLabel(sessions, 'mySession');
    expect(getLabel(sessions, 'mySession')).toBeNull();
  });

  it('multiple sessions same label are all returned by listByLabel', () => {
    let sessions = {
      a: { urls: [] },
      b: { urls: [] },
      c: { urls: [] },
    };
    sessions = setLabel(sessions, 'a', 'group1');
    sessions = setLabel(sessions, 'b', 'group1');
    sessions = setLabel(sessions, 'c', 'group2');
    const group1 = listByLabel(sessions, 'group1');
    expect(group1).toHaveLength(2);
    expect(group1.map(s => s.name)).toEqual(expect.arrayContaining(['a', 'b']));
  });

  it('overwriting a label reflects in listByLabel', () => {
    let sessions = { x: { urls: [], label: 'old' }, y: { urls: [], label: 'old' } };
    sessions = setLabel(sessions, 'x', 'new');
    expect(listByLabel(sessions, 'old')).toHaveLength(1);
    expect(listByLabel(sessions, 'new')).toHaveLength(1);
  });
});
