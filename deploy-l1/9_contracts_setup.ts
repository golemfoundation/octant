import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import {
  BEACONCHAIN_VALIDATOR_INDEXES,
  EXECUTION_LAYER_VALIDATOR_ADDRESS,
} from '../env';
import {
  BEACON_CHAIN_ORACLE,
  EXECUTION_LAYER_ORACLE
} from '../helpers/constants';
import { BeaconChainOracle, ExecutionLayerOracle } from '../typechain-types';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {

  let validatorIndexes = BEACONCHAIN_VALIDATOR_INDEXES;
  let validatorAddress = EXECUTION_LAYER_VALIDATOR_ADDRESS;
  if (hre.network.name === 'hardhat') {
    const { Alice } = await hre.ethers.getNamedSigners()
    validatorAddress = Alice.address;
  }

  const beaconChainOracle: BeaconChainOracle = await hre.ethers.getContract(BEACON_CHAIN_ORACLE);
  const executionLayerOracle: ExecutionLayerOracle = await hre.ethers.getContract(EXECUTION_LAYER_ORACLE);
  await beaconChainOracle.setValidatorIndexes(validatorIndexes);
  await executionLayerOracle.setValidatorAddress(validatorAddress);

};
export default func;
func.tags = ['setup','local', 'test', 'goerli'];
