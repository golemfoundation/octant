import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { DEPOSITS, TRACKER, TRACKER_WRAPPER } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const deposits = await ethers.getContract(DEPOSITS);
  const tracker = await ethers.getContract(TRACKER);

  await deploy(TRACKER_WRAPPER, {
    args: [tracker.address, deposits.address],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['tracker-proxy', 'local', 'test', 'testnet'];
