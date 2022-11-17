import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { DEPOSITS, TRACKER, EPOCHS } from '../helpers/constants';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const epochs = await ethers.getContract(EPOCHS);
  const deposits = await ethers.getContract(DEPOSITS);

  const tracker = await deploy(TRACKER, {
    from: deployer,
    log: true,
    args: [epochs.address, deposits.address],
    autoMine: true
  });

  await deposits.setDepositTrackerAddress(tracker.address);
};
export default func;
func.tags = ['deposits', 'local', 'test', 'goerli'];
