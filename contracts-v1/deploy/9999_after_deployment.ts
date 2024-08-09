import { execSync } from 'child_process';
import fs from 'fs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { GLM_ADDRESS, SKIP_LOCAL_SUBGRAPH_UPDATE } from '../env';
import {
  AUTH,
  EPOCHS,
  DEPOSITS,
  PROPOSALS,
  TOKEN,
  VAULT,
  WITHDRAWALS_TARGET,
} from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // Prepare .env for client
  /* eslint-disable no-console */
  const authInfo = await hre.deployments.get(AUTH);
  const auth = await hre.ethers.getContractAt(authInfo.abi, authInfo.address);
  const withdrawalsInfo = await hre.deployments.get(WITHDRAWALS_TARGET);
  const withdrawals = await hre.ethers.getContractAt(withdrawalsInfo.abi, withdrawalsInfo.address);
  const epochsInfo = await hre.deployments.get(EPOCHS);
  const epochs = await hre.ethers.getContractAt(epochsInfo.abi, epochsInfo.address);
  const depositsInfo = await hre.deployments.get(DEPOSITS);
  const deposits = await hre.ethers.getContractAt(depositsInfo.abi, depositsInfo.address);
  const proposalsInfo = await hre.deployments.get(PROPOSALS);
  const proposals = await hre.ethers.getContractAt(proposalsInfo.abi, proposalsInfo.address);
  const vaultInfo = await hre.deployments.get(VAULT);
  const vault = await hre.ethers.getContractAt(vaultInfo.abi, vaultInfo.address);
  let glmAddress = GLM_ADDRESS;

  if (['hardhat', 'localhost'].includes(hre.network.name)) {
    glmAddress = (await hre.deployments.get(TOKEN)).address;
  }
  console.log(`GLM_CONTRACT_ADDRESS=${glmAddress}`);
  console.log(`DEPOSITS_CONTRACT_ADDRESS=${deposits.address}`);
  console.log(`EPOCHS_CONTRACT_ADDRESS=${epochs.address}`);
  console.log(`PROPOSALS_CONTRACT_ADDRESS=${proposals.address}`);
  console.log(`WITHDRAWALS_TARGET_CONTRACT_ADDRESS=${withdrawals.address}`);
  console.log(`VAULT_CONTRACT_ADDRESS=${vault.address}`);

  console.log(`Deployment finished at block number: ${await hre.ethers.provider.getBlockNumber()}`);
  /* eslint-disable no-console */

  const contractAddresses = `
GLM_CONTRACT_ADDRESS=${glmAddress}
AUTH_CONTRACT_ADDRESS=${auth.address}
DEPOSITS_CONTRACT_ADDRESS=${deposits.address}
EPOCHS_CONTRACT_ADDRESS=${epochs.address}
PROPOSALS_CONTRACT_ADDRESS=${proposals.address}
WITHDRAWALS_TARGET_CONTRACT_ADDRESS=${withdrawals.address}
VAULT_CONTRACT_ADDRESS=${vault.address}
`; // Newline is intentional

  fs.appendFileSync('deployments/clientEnv', contractAddresses);

  if (['localhost'].includes(hre.network.name)) {
    if (SKIP_LOCAL_SUBGRAPH_UPDATE === 'false') {
      // Update networks.json for local (developer's) subgraph instance.
      const networksFn = '../subgraph/networks.json';
      const templateFn = '../subgraph/networks.template.json';
      try {
        fs.accessSync(networksFn, fs.constants.W_OK);
      } catch (_err) {
        fs.copyFileSync(templateFn, networksFn);
      }

      // this populates networks.json (used by docker among others)
      const json = JSON.parse(fs.readFileSync(networksFn).toString());
      json.localhost.GLM.address = glmAddress;
      json.localhost.Epochs.address = epochs.address;
      json.localhost.Deposits.address = deposits.address;
      json.localhost.Vault.address = vault.address;
      json.localhost.Proposals.address = proposals.address;
      fs.writeFileSync(networksFn, JSON.stringify(json, null, 2));

      // need to update subgraph/src/*.ts files too
      execSync('../subgraph/configure-network.sh', {
        cwd: '../subgraph/',
        env: { ...process.env, NETWORK: 'localhost' },
      });
    }
  }
};

export default func;
func.tags = ['after-deployment', 'testnet', 'local'];
