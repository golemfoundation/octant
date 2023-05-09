import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { GLM_ADDRESS } from '../env';
import { AUTH, DEPOSITS, TOKEN } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  let glmAddress = GLM_ADDRESS;
  if (['hardhat', 'localhost'].includes(hre.network.name)) {
    const token = await ethers.getContract(TOKEN);
    glmAddress = token.address;
  }

  const auth = await ethers.getContract(AUTH);

  await deploy(DEPOSITS, {
    args: [glmAddress, auth.address],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['deposits', 'local', 'test', 'testnet'];
