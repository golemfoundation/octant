import { deployments, ethers, getNamedAccounts } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { TOKEN, DEPOSITS } from '../helpers/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
	const token = await ethers.getContract(TOKEN);

  await deploy(DEPOSITS, {
    from: deployer,
    log: true,
    args: [token.address]
  });
};
export default func;
func.tags = ['main'];
