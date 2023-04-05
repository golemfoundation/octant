import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { GOERLI_GLM, GOERLI_GNT } from '../env';
import { DEPOSITS, EPOCHS, TOKEN, TRACKER } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  let glmAddress = GOERLI_GLM;
  let gntAddress = GOERLI_GNT;
  if (['hardhat', 'localhost'].includes(hre.network.name)) {
    const token = await ethers.getContract(TOKEN);
    glmAddress = token.address;
    gntAddress = token.address;
  }

  const epochs = await ethers.getContract(EPOCHS);
  const deposits = await ethers.getContract(DEPOSITS);

  await deploy(TRACKER, {
    args: [epochs.address, deposits.address, glmAddress, gntAddress],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['deposits', 'local', 'test', 'goerli'];
