import { task, types } from 'hardhat/config';
import { exit } from 'process';

import { MULTISIG_ADDRESS, PROPOSALS_CID, PROPOSALS_ADDRESSES, GLM_ADDRESS } from '../env';
import { ZERO_ADDRESS } from '../helpers/constants';

task('verify-deployment', 'Verify deployed contracts')
  .addFlag('auth', 'Verifies Auth contaract storage against expected values')
  .addFlag('deposits', 'Verifies  Deposists contract storage against expected values')
  .addFlag('proposals', 'Verifies Proposals contract storage against expected values')
  .addOptionalParam(
    'file',
    'File with expected values in json format. Explicitly defined arguments take precedence.',
  )
  // Auth
  .addParam('authaddress', 'Auth contract address')
  .addOptionalParam('multisig', 'Expected multisig', MULTISIG_ADDRESS)
  .addOptionalParam('pendingowner', 'Expected Auth pendingOwner', ZERO_ADDRESS)
  // Deposits
  .addParam('depositsaddress', 'Deposits contract address')
  .addOptionalParam('glm', 'Expected GLM contract address', GLM_ADDRESS)
  // Proposals
  .addOptionalParam('proposalsaddress', 'Proposals contract address')
  .addOptionalParam('epochs', 'Expected Epochs contract address', ZERO_ADDRESS)
  .addOptionalParam('cid', 'Expected cid', PROPOSALS_CID)
  .addOptionalParam('epoch', 'Epoch at which to query for proposals', 100, types.int)
  .addOptionalParam(
    'proposalslist',
    'Comma separated list of expected proposals',
    PROPOSALS_ADDRESSES,
  )
  .setAction(async (taskArgs, hre) => {
    let errors = 0;

    if (taskArgs.auth) {
      const result = await hre.run('auth-check:verify', {
        address: taskArgs.authaddress,
        multisig: taskArgs.multisig,
        pendingowner: taskArgs.pendingowner,
      });
      errors += result;
    }

    if (taskArgs.deposits) {
      const result = await hre.run('deposits-check:verify', {
        address: taskArgs.depositsaddress,
        auth: taskArgs.authaddress,
        glm: taskArgs.glm,
      });
      errors += result;
    }

    if (taskArgs.proposals) {
      const result = await hre.run('proposals-check:verify', {
        address: taskArgs.proposalsaddress,
        auth: taskArgs.authaddress,
        cid: taskArgs.cid,
        epoch: taskArgs.epoch,
        epochs: taskArgs.epochs,
        proposals: taskArgs.proposalslist,
      });
      errors += result;
    }

    exit(errors);
  });
