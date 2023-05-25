import fs from 'fs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { DEPOSITS } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Prepare .env for client
  /* eslint-disable no-console */
  const deposits = await hre.ethers.getContract(DEPOSITS);
  console.log(`VITE_DEPOSITS_ADDRESS=${deposits.address}`);
  console.log(`Deployment finished at block number: ${await hre.ethers.provider.getBlockNumber()}`);
  /* eslint-disable no-console */

  const contractAddresses = `
VITE_DEPOSITS_ADDRESS=${deposits.address}`;

  fs.appendFileSync('deployments/clientEnv', contractAddresses);
};

export default func;
func.tags = ['after-deployment', 'testnet', 'local'];
