import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { ALLOCATIONS, DEPOSITS } from '../helpers/constants';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {

  const allocations = await hre.ethers.getContract(ALLOCATIONS);
  console.log('Generating subgraph for Allocations contract...');
  await hre.run('graph', { contractName: ALLOCATIONS, address: allocations.address });

  const deposits = await hre.ethers.getContract(DEPOSITS);
  console.log('Generating subgraph for Deposits contract...');
  await hre.run('graph', { contractName: DEPOSITS, address: deposits.address });
};

export default func;
func.tags = ['subgraph', 'goerli'];
