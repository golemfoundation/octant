/* eslint-disable import/no-extraneous-dependencies */
import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'hardhat-docgen';
import 'hardhat-gas-reporter';
import { HardhatUserConfig } from 'hardhat/types';

import { ETHERSCAN_API_KEY, GOERLI_PRIVATE_KEY, GOERLI_URL, IS_GAS_REPORTING_ENABLED } from './env';

import './tasks/clean';
import './tasks/increase-time';
import './tasks/mine';
import './tasks/prepare-local-test-env';
import './tasks/send-glm';
import './tasks/target-upgrade';
import './tasks/target-deploy';
import './tasks/target-check';
import './tasks/target-fund';

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
    TestFoundation: {
      default: 6,
    },
    deployer: {
      default: 0,
      localhost: 0,
    },
  },
  networks: {
    goerli: {
      accounts: [GOERLI_PRIVATE_KEY],
      url: GOERLI_URL,
    },
    hardhat: {
      chainId: 1337,
      initialBaseFeePerGas: 0,
    },
    localhost: {
      chainId: 1337,
      initialBaseFeePerGas: 0,
      url: 'http://127.0.0.1:8545',
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
};

export default config;
