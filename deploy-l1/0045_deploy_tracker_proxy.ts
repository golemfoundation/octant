import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DEPOSITS, TRACKER, TRACKER_WRAPPER } from '../helpers/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const deposits = await ethers.getContract(DEPOSITS);
  const tracker = await ethers.getContract(TRACKER);

  await deploy(TRACKER_WRAPPER, {
    from: deployer,
    log: true,
    args: [tracker.address, deposits.address],
    autoMine: true
  });
};
export default func;
func.tags = ['tracker-proxy', 'local', 'test', 'goerli'];
