import { getNetworkConfig } from './index';

import { localNetworkConfig, sepoliaNetworkConfig, mainnetNetworkConfig } from './configs';

jest.mock('wagmi/chains', () => ({
  mainnet: 'mainnet-chain-mock',
  sepolia: 'sepolia-chain-mock',
}));
jest.mock('env', () => ({}));

describe('networkConfig', () => {
  it('should return Mainnet networkConfig when env.network is Mainnet', () => {
    // @ts-expect-error Only part of env file is passed here.
    expect(getNetworkConfig({ network: 'Mainnet' })).toEqual(mainnetNetworkConfig);
  });

  it('should return Sepolia networkConfig when env.network is Sepolia', () => {
    // @ts-expect-error Only part of env file is passed here.
    expect(getNetworkConfig({ network: 'Sepolia' })).toEqual(sepoliaNetworkConfig);
  });

  it('should return Local networkConfig when env.network is Local', () => {
    expect(
      // @ts-expect-error Only part of env file is passed here.
      getNetworkConfig({ network: 'Local' }),
    ).toEqual(localNetworkConfig);
  });

  it('should return Sepolia networkConfig when env.network is not Local, not Mainnet and not Sepolia', () => {
    expect(
      // @ts-expect-error Only part of env file is passed here.
      getNetworkConfig({ network: 'SomeOtherNetwork' }),
    ).toEqual(sepoliaNetworkConfig);
  });
});
