import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ALLOCATIONS, ALLOCATIONS_STORAGE, EPOCHS, TRACKER } from '../helpers/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const epochs = await hre.ethers.getContract(EPOCHS);
  const allocationsStorage = await hre.ethers.getContract(ALLOCATIONS_STORAGE);
  const tracker = await hre.ethers.getContract(TRACKER);

  await deploy(ALLOCATIONS, {
    from: deployer,
    log: true,
    args: [epochs.address, allocationsStorage.address, tracker.address],
    autoMine: true,
  });
};
export default func;
func.tags = ['allocations', 'local', 'test', 'goerli'];
