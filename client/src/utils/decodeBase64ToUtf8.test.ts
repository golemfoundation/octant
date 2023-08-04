import decodeBase64ToUtf8 from './decodeBase64ToUtf8';

describe('decodeBase64ToUtf8', () => {
  const encodedString = 'RXRoZXJldW3igJlz';

  it('simple atob should not decode some of the characters to utf-8', () => {
    expect(atob(encodedString)).toBe('Ethereumâs');
  });

  it('util function should properly decode base64 to utf-8', () => {
    expect(decodeBase64ToUtf8(encodedString)).toBe('Ethereum’s');
  });
});
