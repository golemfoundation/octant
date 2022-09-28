import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { GOERLI_GLM } from '../env';
import { TOKEN, DEPOSITS } from '../helpers/constants';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();
  let glmAddress = GOERLI_GLM;
  if (hre.network.name === 'hardhat') {
    const token = await ethers.getContract(TOKEN);
    glmAddress = token.address
  }

  await deploy(DEPOSITS, {
    from: deployer,
    log: true,
    args: [glmAddress],
    autoMine: true
  });
};
export default func;
func.tags = ['proposals', 'local', 'test', 'goerli'];
