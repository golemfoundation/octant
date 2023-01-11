import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ALLOCATIONS, ALLOCATIONS_STORAGE, EPOCHS, REWARDS } from '../helpers/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const epochs = await hre.ethers.getContract(EPOCHS);
  const allocationsStorage = await hre.ethers.getContract(ALLOCATIONS_STORAGE);
  const rewards = await hre.ethers.getContract(REWARDS);

  await deploy(ALLOCATIONS, {
    from: deployer,
    log: true,
    args: [epochs.address, allocationsStorage.address, rewards.address],
    autoMine: true,
  });
};
export default func;
func.tags = ['allocations', 'local', 'test', 'goerli'];
