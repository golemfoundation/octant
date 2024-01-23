import '@nomicfoundation/hardhat-toolbox';

import '@nomiclabs/hardhat-etherscan';
import {HardhatUserConfig} from 'hardhat/config';

import {ETHERSCAN_API_KEY, TESTNET_PRIVATE_KEY, GOERLI_RPC_URL, HOLESKY_RPC_URL} from './env';

const config: HardhatUserConfig = {
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    customChains: [
      {
        network: "holesky",
        chainId: 17000,
        urls: {
          apiURL: "https://api-holesky.etherscan.io/api",
          browserURL: "https://holesky.etherscan.io"
        }
      }
    ],

  },
  gasReporter: {
    enabled: true,
  },
  networks: {
    goerli: {
      accounts: [TESTNET_PRIVATE_KEY],
      chainId: 5,
      url: GOERLI_RPC_URL,
    },
    holesky: {
      accounts: [TESTNET_PRIVATE_KEY],
      chainId: 17000,
      url: HOLESKY_RPC_URL,
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
