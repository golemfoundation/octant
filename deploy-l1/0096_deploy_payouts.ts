import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { EPOCHS, PAYOUTS, REWARDS } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const epochs = await ethers.getContract(EPOCHS);
  const rewards = await ethers.getContract(REWARDS);
  // TODO change to Withdrawals contract when implemented
  const withdrawals = deployer;

  await deploy(PAYOUTS, {
    args: [rewards.address, epochs.address, withdrawals],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['payouts', 'local', 'test', 'goerli'];
