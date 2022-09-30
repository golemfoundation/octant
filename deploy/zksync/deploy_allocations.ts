import { Wallet } from "zksync-web3";
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { GOERLI_PRIVATE_KEY } from '../../env';
import { ALLOCATIONS } from '../../helpers/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const wallet = new Wallet(GOERLI_PRIVATE_KEY);
  const deployer = new Deployer(hre, wallet);

  console.log(`Running zkSync deploy script for the Allocations contract`);
  const artifact = await deployer.loadArtifact(ALLOCATIONS);
  const allocationsContract = await deployer.deploy(artifact);

  const contractAddress = allocationsContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
};
export default func;
func.tags = ['zksync'];
