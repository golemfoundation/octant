import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { AUTH_ADDRESS } from '../env';
import { AUTH, VAULT } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const authAddress = AUTH_ADDRESS || (await hre.deployments.get(AUTH)).address;

  await deploy(VAULT, {
    args: [authAddress],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['epoch2', 'local', 'test', 'testnet', 'vault'];
