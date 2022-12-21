import { Deployer } from '@matterlabs/hardhat-zksync-deploy';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Wallet } from 'zksync-web3';
import { DECISION_WINDOW, EPOCH_DURATION, EPOCHS_START, GOERLI_PRIVATE_KEY } from '../env';
import { EPOCHS } from '../helpers/constants';
import { getLatestBlockTimestamp } from '../helpers/misc-utils';


const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const wallet = new Wallet(GOERLI_PRIVATE_KEY);
  const deployer = new Deployer(hre, wallet);

  console.log(`Running zkSync deploy script for the Epochs contract`);
  const artifact = await deployer.loadArtifact(EPOCHS);
  let start = EPOCHS_START ? Number(EPOCHS_START) : await getLatestBlockTimestamp();
  const epochsContract = await deployer.deploy(artifact, [start, EPOCH_DURATION, DECISION_WINDOW]);

  const contractAddress = epochsContract.address;
  console.log(`${artifact.contractName} was deployed to ${contractAddress}`);

  hre.config.zkSyncContracts.epochsAddress = contractAddress;
};
export default func;
func.tags = ['zksync'];
