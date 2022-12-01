import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { GOERLI_GLM, GOERLI_GNT } from '../env';
import { DEPOSITS, TRACKER, EPOCHS, TOKEN } from '../helpers/constants';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  let glmAddress = GOERLI_GLM;
  let gntAddress = GOERLI_GNT;
  if (hre.network.name === 'hardhat') {
    const token = await ethers.getContract(TOKEN);
    glmAddress = token.address;
    gntAddress = token.address;
  }

  const epochs = await ethers.getContract(EPOCHS);
  const deposits = await ethers.getContract(DEPOSITS);

  await deploy(TRACKER, {
    from: deployer,
    log: true,
    args: [epochs.address, deposits.address, glmAddress, gntAddress],
    autoMine: true
  });
};
export default func;
func.tags = ['deposits', 'local', 'test', 'goerli'];
