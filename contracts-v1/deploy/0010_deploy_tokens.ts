import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { TOKEN } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer, Alice, Bob } = await hre.getNamedAccounts();

  await deploy(TOKEN, {
    args: [[deployer, Alice, Bob]],
    autoMine: true,
    contract: 'Token',
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['token', 'local', 'test'];
