import { ethers } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { GOERLI_GLM } from '../env';
import { FAUCET, TOKEN } from '../helpers/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  let glmAddress = GOERLI_GLM;
  if (hre.network.name === 'hardhat') {
    const token = await ethers.getContract(TOKEN);
    glmAddress = token.address;
  }

  await deploy(FAUCET, {
    from: deployer,
    log: true,
    args: [glmAddress],
    autoMine: true
  });
};
export default func;
func.tags = ['faucet', 'test'];
