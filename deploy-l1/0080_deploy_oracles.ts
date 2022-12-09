import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import {
  BEACON_CHAIN_ORACLE,
  HEXAGON_ORACLE,
  EXECUTION_LAYER_ORACLE, EPOCHS
} from '../helpers/constants';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const epochs = await ethers.getContract(EPOCHS);
  const beaconChainOracle = await deploy(BEACON_CHAIN_ORACLE, {
    from: deployer,
    log: true,
    args: [epochs.address],
    autoMine: true,
  });

  const executionLayerOracle = await deploy(EXECUTION_LAYER_ORACLE, {
    from: deployer,
    log: true,
    args: [epochs.address],
    autoMine: true,
  });

  await deploy(HEXAGON_ORACLE, {
    from: deployer,
    log: true,
    args: [beaconChainOracle.address, executionLayerOracle.address],
    autoMine: true,
  });
};
export default func;
func.tags = ['oracle','local', 'test', 'goerli'];
