import fs from 'fs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import path from 'path';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /* eslint-disable no-console */
  const blockNumber = await hre.ethers.provider.getBlockNumber();
  console.log(`Starting deployment at block number: ${blockNumber}`);
  /* eslint-disable no-console */

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  fs.writeFileSync('deployments/clientEnv', `BLOCK_NUMBER=${blockNumber}`);
};

export default func;
func.tags = ['before-deployment', 'local', 'testnet'];
