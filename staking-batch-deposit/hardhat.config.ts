import '@nomicfoundation/hardhat-toolbox';

import '@nomiclabs/hardhat-etherscan';
import { HardhatUserConfig } from 'hardhat/config';

import { ETHERSCAN_API_KEY, TESTNET_PRIVATE_KEY, TESTNET_RPC_URL } from './env';

const config: HardhatUserConfig = {
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
  },
  networks: {
    goerli: {
      accounts: [TESTNET_PRIVATE_KEY],
      url: TESTNET_RPC_URL,
    },
    hardhat: {
      accounts: {
        accountsBalance: "1000000000000000000000000",
      },
      chainId: 1337,
      initialBaseFeePerGas: 0,
    },
    localhost: {
      chainId: 1337,
      initialBaseFeePerGas: 0,
      url: 'http://127.0.0.1:8545',
    },
  },
  solidity: '0.6.11',
  typechain: {
    outDir: 'typechain/typechain-types',
    target: 'ethers-v5',
  },
};

export default config;
