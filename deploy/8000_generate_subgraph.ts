import fs from 'fs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { ALLOCATIONS, DEPOSITS } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const networkFile = 'subgraph/networks.json';
  if (!fs.existsSync(networkFile)) {
    fs.writeFileSync(networkFile, JSON.stringify({}, null, 4));
  }

  const allocations = await hre.ethers.getContract(ALLOCATIONS);
  // eslint-disable-next-line no-console
  console.log('Generating subgraph for Allocations contract...');
  await hre.run('graph', { address: allocations.address, contractName: ALLOCATIONS });

  const deposits = await hre.ethers.getContract(DEPOSITS);
  // eslint-disable-next-line no-console
  console.log('Generating subgraph for Deposits contract...');
  await hre.run('graph', { address: deposits.address, contractName: DEPOSITS });
};

export default func;
func.tags = ['subgraph', 'goerli'];
