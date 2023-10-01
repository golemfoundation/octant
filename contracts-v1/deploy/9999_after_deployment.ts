import { execSync } from 'child_process';
import fs from 'fs';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { GLM_ADDRESS, GNT_ADDRESS, SKIP_LOCAL_SUBGRAPH_UPDATE } from '../env';
import {
  AUTH,
  EPOCHS,
  DEPOSITS,
  GNT,
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
  const auth = await hre.ethers.getContract(AUTH);
  const withdrawals = await hre.ethers.getContract(WITHDRAWALS_TARGET);
  const epochs = await hre.ethers.getContract(EPOCHS);
  const deposits = await hre.ethers.getContract(DEPOSITS);
  const proposals = await hre.ethers.getContract(PROPOSALS);
  const vault = await hre.ethers.getContract(VAULT);
  let gntAddress = GNT_ADDRESS;
  let glmAddress = GLM_ADDRESS;

  if (['hardhat', 'localhost'].includes(hre.network.name)) {
    gntAddress = (await hre.ethers.getContract(GNT)).address;
    glmAddress = (await hre.ethers.getContract(TOKEN)).address;
  }
  console.log(`GNT_CONTRACT_ADDRESS=${gntAddress}`);
  console.log(`GLM_CONTRACT_ADDRESS=${glmAddress}`);
  console.log(`DEPOSITS_CONTRACT_ADDRESS=${deposits.address}`);
  console.log(`EPOCHS_CONTRACT_ADDRESS=${epochs.address}`);
  console.log(`PROPOSALS_CONTRACT_ADDRESS=${proposals.address}`);
  console.log(`WITHDRAWALS_TARGET_CONTRACT_ADDRESS=${withdrawals.address}`);
  console.log(`VAULT_CONTRACT_ADDRESS=${vault.address}`);

  console.log(`Deployment finished at block number: ${await hre.ethers.provider.getBlockNumber()}`);
  /* eslint-disable no-console */

  const contractAddresses = `
GNT_CONTRACT_ADDRESS=${gntAddress}
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
      json.localhost.GNT.address = gntAddress;
      json.localhost.GLM.address = glmAddress;
      json.localhost.Epochs.address = epochs.address;
      json.localhost.Deposits.address = deposits.address;
      json.localhost.Vault.address = vault.address;
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
