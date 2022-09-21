import { HardhatUserConfig } from "hardhat/types";
import "hardhat-deploy";
import "hardhat-deploy-ethers";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 1337,
      initialBaseFeePerGas: 0,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      initialBaseFeePerGas: 0,
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
  }
};

export default config;
