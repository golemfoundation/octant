import fs from 'fs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { GLM_ADDRESS, GNT_ADDRESS } from '../env';
import { WITHDRAWALS_TARGET, EPOCHS, DEPOSITS, PROPOSALS, VAULT } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Prepare .env for client
  /* eslint-disable no-console */
  const withdrawals = await hre.ethers.getContract(WITHDRAWALS_TARGET);
  const epochs = await hre.ethers.getContract(EPOCHS);
  const deposits = await hre.ethers.getContract(DEPOSITS);
  const proposals = await hre.ethers.getContract(PROPOSALS);
  const vault = await hre.ethers.getContract(VAULT);

  console.log(`GNT_CONTRACT_ADDRESS=${GNT_ADDRESS}`);
  console.log(`GLM_CONTRACT_ADDRESS=${GLM_ADDRESS}`);

  console.log(`DEPOSITS_CONTRACT_ADDRESS=${deposits.address}`);
  console.log(`EPOCHS_CONTRACT_ADDRESS=${epochs.address}`);
  console.log(`PROPOSALS_CONTRACT_ADDRESS=${proposals.address}`);
  console.log(`WITHDRAWALS_TARGET_CONTRACT_ADDRESS=${withdrawals.address}`);
  console.log(`VAULT_CONTRACT_ADDRESS=${vault.address}`);

  console.log(`Deployment finished at block number: ${await hre.ethers.provider.getBlockNumber()}`);
  /* eslint-disable no-console */

  const contractAddresses = `
GNT_CONTRACT_ADDRESS=${GNT_ADDRESS}
GLM_CONTRACT_ADDRESS=${GLM_ADDRESS}
DEPOSITS_CONTRACT_ADDRESS=${deposits.address}
EPOCHS_CONTRACT_ADDRESS=${epochs.address}
PROPOSALS_CONTRACT_ADDRESS=${proposals.address}
WITHDRAWALS_TARGET_CONTRACT_ADDRESS=${withdrawals.address}
VAULT_CONTRACT_ADDRESS=${vault.address}
`; // Newline is intentional

  fs.appendFileSync('deployments/clientEnv', contractAddresses);
};

export default func;
func.tags = ['after-deployment', 'testnet', 'local'];
