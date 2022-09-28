import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { TOKEN } from '../helpers/constants';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  await deploy(TOKEN, {
    from: deployer,
    log: true,
    args: [],
    autoMine: true
  });
};
export default func;
func.tags = ['token','local', 'test'];
