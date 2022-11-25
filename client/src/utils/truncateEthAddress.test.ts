import truncateEthAddress from './truncateEthAddress';

describe('truncateEthAddress', () => {
  it('correctly truncates ETH address to 0x, 3 characters, 3 dots, 4 characters', () => {
    expect(truncateEthAddress('0x7358B726830A2E222f9b139E90483A37142bcBE5')).toBe('0x735...cBE5');
  });
});
