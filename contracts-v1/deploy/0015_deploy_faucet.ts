import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { GOERLI_GLM } from '../env';
import { FAUCET, TOKEN } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  let glmAddress = GOERLI_GLM;
  if (['hardhat', 'localhost'].includes(hre.network.name)) {
    const token = await ethers.getContract(TOKEN);
    glmAddress = token.address;
  }

  await deploy(FAUCET, {
    args: [glmAddress],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['faucet', 'test'];
