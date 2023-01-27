/* eslint-disable import/no-extraneous-dependencies */
import '@graphprotocol/hardhat-graph';
import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';
import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'hardhat-docgen';
import 'hardhat-gas-reporter';
import { HardhatUserConfig } from 'hardhat/types';

import {
  ETHERSCAN_API_KEY,
  GOERLI_PRIVATE_KEY,
  GOERLI_URL,
  IS_GAS_REPORTING_ENABLED,
  ZKSYNC_URL,
} from './env';

import './tasks/clean';
import './tasks/deploy-zksync';
import './tasks/increase-time';
import './tasks/mine';
import './tasks/prepare-local-test-env';
import './tasks/send-glm';

const config: HardhatUserConfig = {
  docgen: {
    clear: true,
    path: '.docs',
  },
  gasReporter: {
    enabled: IS_GAS_REPORTING_ENABLED,
  },
  namedAccounts: {
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
    deployer: {
      default: 0,
      localhost: 0,
    },
  },
  networks: {
    goerli: {
      accounts: [GOERLI_PRIVATE_KEY],
      deploy: ['deploy-l1/'],
      url: GOERLI_URL,
    },
    hardhat: {
      chainId: 1337,
      deploy: ['deploy-l1/'],
      initialBaseFeePerGas: 0,
    },
    localhost: {
      chainId: 1337,
      deploy: ['deploy-l1/'],
      initialBaseFeePerGas: 0,
      url: 'http://127.0.0.1:8545',
    },
    zksync: {
      accounts: [GOERLI_PRIVATE_KEY],
      // "deploy" dir is hardcoded in hardhat-zksync-deploy plugin, we cannot change this path. Putting it here to mark it explicitly.
      deploy: ['deploy/'],

      url: ZKSYNC_URL,

      zksync: true,
    },
  },
  solidity: {
    settings: {
      outputSelection: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '*': {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '*': ['storageLayout'],
        },
      },
    },
    version: '0.8.9',
  },
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
    },
  },
  zkSyncDeploy: {
    ethNetwork: GOERLI_URL,
    zkSyncNetwork: ZKSYNC_URL,
  },
  zksolc: {
    compilerSource: 'binary',
    version: '1.1.6',
  },
};

export default config;
