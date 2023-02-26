import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { ALLOCATIONS, ALLOCATIONS_STORAGE, EPOCHS, PROPOSALS, REWARDS } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const epochs = await hre.ethers.getContract(EPOCHS);
  const allocationsStorage = await hre.ethers.getContract(ALLOCATIONS_STORAGE);
  const rewards = await hre.ethers.getContract(REWARDS);
  const proposals = await hre.ethers.getContract(PROPOSALS);

  await deploy(ALLOCATIONS, {
    args: [epochs.address, allocationsStorage.address, rewards.address, proposals.address],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['allocations', 'local', 'test', 'goerli'];
