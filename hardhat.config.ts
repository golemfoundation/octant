import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';

import 'hardhat-docgen';
import 'hardhat-gas-reporter';
import { HardhatUserConfig } from 'hardhat/types';

import { ETHERSCAN_API_KEY, GOERLI_PRIVATE_KEY, GOERLI_URL, REPORT_GAS, ZKSYNC_URL } from './env';

import './tasks/clean';
import './tasks/deploy-zksync';
import './tasks/mine';
import './tasks/increase-time';
import './tasks/send-glm';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.9',
    settings: {
      outputSelection: {
        "*": {
          "*": ["storageLayout"]
        }
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337,
      initialBaseFeePerGas: 0,
      deploy: ['deploy-l1/']
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 1337,
      initialBaseFeePerGas: 0,
      deploy: ['deploy-l1/']
    },
    goerli: {
      url: GOERLI_URL,
      accounts: [GOERLI_PRIVATE_KEY],
      deploy: ['deploy-l1/'],
      gasPrice: 10_000_000_000
    },
    zksync: {
      url: ZKSYNC_URL,
      accounts: [GOERLI_PRIVATE_KEY],
      zksync: true,
      // "deploy" dir is hardcoded in hardhat-zksync-deploy plugin, we cannot change this path. Putting it here to mark it explicitly.
      deploy: ['deploy/']
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
      localhost: 0
    },
    Alice: {
      default: 1,
    },
    Bob: {
      default: 2,
    },
    Charlie: {
      default: 3,
    },
    Darth: {
      default: 4,
    },
    Eve: {
      default: 5,
    },
  },
  docgen: {
    path: '.docs',
    clear: true,
  },
  gasReporter: {
    enabled: REPORT_GAS
  },
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY
    }
  },
  zksolc: {
    version: '1.1.6',
    compilerSource: 'binary'
  },
  zkSyncDeploy: {
    zkSyncNetwork: ZKSYNC_URL,
    ethNetwork: GOERLI_URL
  }
};

export default config;
