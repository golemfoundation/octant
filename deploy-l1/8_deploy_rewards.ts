import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { REWARDS, DEPOSITS, TRACKER, EPOCHS, HEXAGON_ORACLE } from '../helpers/constants';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const epochs = await ethers.getContract(EPOCHS);
  const deposits = await ethers.getContract(DEPOSITS);
  const tracker = await ethers.getContract(TRACKER);
  const oracle = await ethers.getContract(HEXAGON_ORACLE);

  await deploy(REWARDS, {
    from: deployer,
    log: true,
    args: [epochs.address, deposits.address, tracker.address, oracle.address],
    autoMine: true
  });
};
export default func;
func.tags = ['rewards', 'local', 'test', 'goerli'];
