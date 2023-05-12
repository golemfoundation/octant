import { parseEther } from 'ethers/lib/utils';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { TOKEN } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const name = 'Token';
  const symbol = 'TKN';
  const amount = parseEther('500000000');

  await deploy(TOKEN, {
    args: [name, symbol, amount],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['token', 'local', 'test'];
