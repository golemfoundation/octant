import { HardhatUserConfig } from 'hardhat/types';
import 'hardhat-deploy';
import 'hardhat-deploy-ethers';
import '@matterlabs/hardhat-zksync-deploy';
import '@matterlabs/hardhat-zksync-solc';
import '@typechain/hardhat';

import { ETHERSCAN_API_KEY, GOERLI_PRIVATE_KEY, GOERLI_URL, ZKSYNC_URL } from './env';

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    hardhat: {
      chainId: 1337,
      initialBaseFeePerGas: 0,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      chainId: 1337,
      initialBaseFeePerGas: 0,
    },
    goerli: {
      url: GOERLI_URL,
      accounts: [GOERLI_PRIVATE_KEY]
    },
    zksync: {
      url: ZKSYNC_URL,
      accounts: [GOERLI_PRIVATE_KEY],
      zksync: true
    }
  },
  namedAccounts: {
    deployer: {
      default: 0,
      localhost: 0
    },
    user: {
      default: 1,
      localhost: 1
    },
  },
  verify: {
    etherscan: {
      apiKey: ETHERSCAN_API_KEY
    }
  },
  zksolc: {
    version: '1.1.5',
    compilerSource: 'docker',
    settings: {
      experimental: {
        dockerImage: 'matterlabs/zksolc',
        tag: 'v1.1.5'
      },
    },
  },
  zkSyncDeploy: {
    zkSyncNetwork: ZKSYNC_URL,
    ethNetwork: GOERLI_URL
  }
};

export default config;
