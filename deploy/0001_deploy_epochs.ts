import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { Wallet } from 'zksync-web3';

import { DECISION_WINDOW, EPOCHS_START, EPOCH_DURATION, GOERLI_PRIVATE_KEY } from '../env';
import { EPOCHS } from '../helpers/constants';
import { getLatestBlockTimestamp } from '../helpers/misc-utils';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const wallet = new Wallet(GOERLI_PRIVATE_KEY);
  const deployer = new Deployer(hre, wallet);

  // eslint-disable-next-line no-console
  console.log(`Running zkSync deploy script for the Epochs contract`);
  const artifact = await deployer.loadArtifact(EPOCHS);
  const start = EPOCHS_START ? Number(EPOCHS_START) : await getLatestBlockTimestamp();
  const epochsContract = await deployer.deploy(artifact, [start, EPOCH_DURATION, DECISION_WINDOW]);

  const contractAddress = epochsContract.address;
  // eslint-disable-next-line no-console
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  // eslint-disable-next-line no-param-reassign
  hre.config.zkSyncContracts.epochsAddress = contractAddress;
};
export default func;
func.tags = ['zksync'];
