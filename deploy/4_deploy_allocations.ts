import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ALLOCATIONS, EPOCHS } from '../helpers/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  const epochs = await hre.ethers.getContract(EPOCHS);

  await deploy(ALLOCATIONS, {
    from: deployer,
    log: true,
    args: [epochs.address],
    autoMine: true,
  });
};
export default func;
func.tags = ['allocations', 'local', 'test'];
