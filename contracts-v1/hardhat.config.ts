/* eslint-disable import/no-extraneous-dependencies */
import '@nomicfoundation/hardhat-chai-matchers';
import '@typechain/hardhat';
import 'hardhat-deploy';
import 'hardhat-docgen';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import { HardhatUserConfig } from 'hardhat/types';

import {
  ETHERSCAN_API_KEY,
  IS_GAS_REPORTING_ENABLED,
  MAINNET_DEPLOYER_PRIVATE_KEY,
  MAINNET_RPC_URL,
  TESTNET_DEPLOYER_PRIVATE_KEY,
  TESTNET_MULTISIG_PRIVATE_KEY,
  TESTNET_RPC_URL,
  LOCAL_RPC_URL,
} from './env';

import './tasks/clean';
import './tasks/increase-time';
import './tasks/mine';
import './tasks/next-epoch';
import './tasks/prepare-local-test-env';
import './tasks/send-glm';
import './tasks/send-eth-and-glm';
import './tasks/target-check';
import './tasks/auth-check';
import './tasks/deposits-check';
import './tasks/proposals-check';
import './tasks/target-deploy';
import './tasks/target-upgrade';
import './tasks/target-withdraw';
import './tasks/status';
import './tasks/verify-deployment';

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
      goerli: 1,
      sepolia: 1,
    },
    deployer: {
      default: 0,
      localhost: 0,
    },
  },
  networks: {
    goerli: {
      accounts: [TESTNET_DEPLOYER_PRIVATE_KEY, TESTNET_MULTISIG_PRIVATE_KEY],
      chainId: 5,
      url: TESTNET_RPC_URL,
    },
    hardhat: {
      chainId: 1337,
      initialBaseFeePerGas: 0,
    },
    localhost: {
      chainId: 1337,
      initialBaseFeePerGas: 0,
      url: LOCAL_RPC_URL,
    },
    mainnet: {
      accounts: [MAINNET_DEPLOYER_PRIVATE_KEY],
      chainId: 1,
      url: MAINNET_RPC_URL,
    },
    sepolia: {
      accounts: [TESTNET_DEPLOYER_PRIVATE_KEY, TESTNET_MULTISIG_PRIVATE_KEY],
      chainId: 11155111,
      gasMultiplier: 2,
      url: TESTNET_RPC_URL,
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
    version: '0.8.18',
  },
  typechain: {
    outDir: 'typechain/typechain-types',
    target: 'ethers-v5',
  },
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY,
    },
  },
};

export default config;
