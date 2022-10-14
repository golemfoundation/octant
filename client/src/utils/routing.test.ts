import getPathObject from './routing';

describe('getPathObject', () => {
  it('properly creates base root path object', () => {
    expect(getPathObject('', '')).toMatchObject({
      absolute: '/',
      relative: '',
    });
  });
  it('properly creates path object for "/" given as root', () => {
    expect(getPathObject('/', 'test')).toMatchObject({
      absolute: '/test',
      relative: 'test',
    });
  });
  it('properly creates path object for given relative path', () => {
    expect(getPathObject('some-path/some-subpath', 'relative-subpath')).toMatchObject({
      absolute: 'some-path/some-subpath/relative-subpath',
      relative: 'relative-subpath',
    });
  });
  it('properly creates path object for Path object given as root path', () => {
    expect(
      getPathObject(
        {
          absolute: 'some-path/some-subpath',
          relative: 'some-subpath',
        },
        'relative-subpath',
      ),
    ).toMatchObject({
      absolute: 'some-path/some-subpath/relative-subpath',
      relative: 'relative-subpath',
    });
  });
});
