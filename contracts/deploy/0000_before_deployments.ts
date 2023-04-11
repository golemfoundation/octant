import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /* eslint-disable no-console */
  const blockNumber = await hre.ethers.provider.getBlockNumber();
  console.log(`BLOCK_NUMBER=${blockNumber}`);
  /* eslint-enable no-console */
};

export default func;
func.tags = ['before-deployment', 'local', 'goerli'];
