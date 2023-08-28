/* eslint no-console: 0 */
import { subtask, task, types } from 'hardhat/config';
import { exit } from 'process';

import { verify, arraysEqualPredicate } from './verification/verifiable';

import { PROPOSALS_CID } from '../env';
import { PROPOSALS, ZERO_ADDRESS } from '../helpers/constants';
import { Proposals } from '../typechain';

task('proposals-check', 'Check proposals at particular addres')
  .addParam('address', 'Proposals contracts address')
  .addParam('contractName', 'Name of the contract', PROPOSALS)
  .addFlag('verify', 'Verifies contract storage against expected values')
  .addOptionalParam('auth', 'Expected Auth contract address')
  .addOptionalParam('cid', 'Expected cid', PROPOSALS_CID)
  .addOptionalParam('epochs', 'Expected epochs contract address', ZERO_ADDRESS)
  .addOptionalParam(
    'epoch',
    'Epoch for which to query for proposal addresses',
    undefined,
    types.int,
  )
  .addParam('proposals', 'Comma separated list of expected proposals')
  .setAction(async (taskArgs, { ethers, getNamedAccounts, run }) => {
    console.log('Querying contract deployed at:', taskArgs.address);
    const { deployer } = await getNamedAccounts();
    const target: Proposals = await ethers.getContractAt(
      taskArgs.contractName,
      taskArgs.address,
      deployer,
    );

    const auth = await target.auth();
    const cid = await target.cid();
    const epochs = await target.epochs();

    console.log('auth: ', auth);
    console.log('cid: ', cid);
    console.log('epochs: ', epochs);

    if (taskArgs.epoch !== undefined) {
      console.log(
        `proposals at epoch ${taskArgs.epoch}: `,
        await target.getProposalAddresses(taskArgs.epoch),
      );
    }

    if (taskArgs.verify) {
      const result = await run('proposals-check:verify', taskArgs);
      exit(result);
    }
  });

subtask('proposals-check:verify', 'Verify Proposals contract')
  .addParam('address', 'proposals contract address')
  .addParam('auth', 'Expected Auth contract address')
  .addParam('epochs', 'Expected Epochs contract address')
  .addParam('cid', 'Expected cid')
  .addParam('epoch', 'Epoch at which to query for proposals', 100, types.int)
  .addParam('proposals', 'Comma separated list of expected proposals')
  .setAction(async (taskArgs, hre) => {
    console.log('Veryfing Proposals contract');

    const res = await verify(
      {
        address: taskArgs.address,
        contractName: PROPOSALS,
        properties: [
          ['auth', taskArgs.auth],
          ['cid', taskArgs.cid],
          ['epochs', taskArgs.epochs],
          [
            ['getProposalAddresses', [taskArgs.epoch]],
            arraysEqualPredicate(taskArgs.proposals.split(',')),
          ],
        ],
      },
      hre,
    );

    if (res === 0) {
      console.log('Proposals contract successfully verified! 👍');
    }

    return res;
  });
