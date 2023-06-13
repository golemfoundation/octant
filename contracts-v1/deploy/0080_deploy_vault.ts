import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { AUTH, VAULT } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const auth = await ethers.getContract(AUTH);

  await deploy(VAULT, {
    args: [auth.address],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['local', 'test', 'testnet', 'vault'];
