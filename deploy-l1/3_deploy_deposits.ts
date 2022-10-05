import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { GOERLI_GLM } from '../env';
import { DEPOSITS, TOKEN, EPOCHS } from '../helpers/constants';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  let glmAddress = GOERLI_GLM;
  if (hre.network.name === 'hardhat') {
    const token = await ethers.getContract(TOKEN);
    glmAddress = token.address
  }

  const epochs = await ethers.getContract(EPOCHS);
  await deploy(DEPOSITS, {
    from: deployer,
    log: true,
    args: [epochs.address, glmAddress],
    autoMine: true
  });
};
export default func;
func.tags = ['deposits', 'local', 'test', 'goerli'];
