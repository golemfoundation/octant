import { goerli, sepolia } from 'wagmi/chains';

import { getNetworkConfig, NetworkConfig } from './index';

jest.mock('wagmi/chains', () => ({
  goerli: 'goerli-chain-mock',
  sepolia: 'sepolia-chain-mock',
}));
jest.mock('env', () => ({}));

const localNetworkConfig: NetworkConfig = {
  chains: [],
  etherscanAddress: '',
  id: -1,
  name: 'Local',
};

const goerliNetworkConfig: NetworkConfig = {
  chains: [goerli],
  etherscanAddress: 'https://goerli.etherscan.io',
  id: 5,
  name: 'Goerli',
};

const sepoliaNetworkConfig: NetworkConfig = {
  chains: [sepolia],
  etherscanAddress: 'https://sepolia.etherscan.io',
  id: 11155111,
  name: 'Sepolia',
};

describe('networkConfig', () => {
  it("should return Goerli networkConfig when env.network is Goerli & env.isUsingLocalContracts is 'false'", () => {
    // @ts-expect-error Only part of env file is passed here.
    expect(getNetworkConfig({ isUsingLocalContracts: 'false', network: 'Goerli' })).toEqual(
      goerliNetworkConfig,
    );
  });

  it("should return Sepolia networkConfig when env.network is Sepolia & env.isUsingLocalContracts is 'false'", () => {
    // @ts-expect-error Only part of env file is passed here.
    expect(getNetworkConfig({ isUsingLocalContracts: 'false', network: 'Sepolia' })).toEqual(
      sepoliaNetworkConfig,
    );
  });

  it("should return Sepolia networkConfig when env.network is not Goerli and not Sepolia & env.isUsingLocalContracts is 'false'", () => {
    expect(
      // @ts-expect-error Only part of env file is passed here.
      getNetworkConfig({ isUsingLocalContracts: 'false', network: 'SomeOtherNetwork' }),
    ).toEqual(sepoliaNetworkConfig);
  });

  it("should return local networkConfig when env.network is Goerli & env.isUsingLocalContracts is 'true'", () => {
    expect(
      // @ts-expect-error Only part of env file is passed here.
      getNetworkConfig({ isUsingLocalContracts: 'true', network: 'SomeOtherNetwork' }),
    ).toEqual(localNetworkConfig);
  });

  it("should return local networkConfig when env.network is Sepolia & env.isUsingLocalContracts is 'true'", () => {
    expect(
      // @ts-expect-error Only part of env file is passed here.
      getNetworkConfig({ isUsingLocalContracts: 'true', network: 'SomeOtherNetwork' }),
    ).toEqual(localNetworkConfig);
  });

  it("should return local networkConfig when env.network is not Goerli and not Sepolia & env.isUsingLocalContracts is 'true'", () => {
    expect(
      // @ts-expect-error Only part of env file is passed here.
      getNetworkConfig({ isUsingLocalContracts: 'true', network: 'SomeOtherNetwork' }),
    ).toEqual(localNetworkConfig);
  });
});
