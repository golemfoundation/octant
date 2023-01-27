import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Wallet } from 'zksync-web3';

import { GOERLI_PRIVATE_KEY } from '../env';
import { ALLOCATIONS } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const wallet = new Wallet(GOERLI_PRIVATE_KEY);
  const deployer = new Deployer(hre, wallet);

  // eslint-disable-next-line no-console
  console.log(`Running zkSync deploy script for the Allocations contract`);
  const allocations = await deployer.loadArtifact(ALLOCATIONS);
  const allocationsContract = await deployer.deploy(allocations, [
    hre.config.zkSyncContracts.epochsAddress,
  ]);

  const contractAddress = allocationsContract.address;
  // eslint-disable-next-line no-console
  console.log(`${allocations.contractName} was deployed to ${contractAddress}`);
};
export default func;
func.tags = ['zksync'];
