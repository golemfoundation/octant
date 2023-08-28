import { subtask, task } from 'hardhat/config';
import { exit } from 'process';

import { verify } from './verification/verifiable';

/* eslint no-console: 0 */
import { AUTH, ZERO_ADDRESS } from '../helpers/constants';
import { Auth } from '../typechain';

task('auth-check', 'Check auth at particular addres')
  .addParam('address', 'Auth contract address')
  .addParam('contractName', 'Name of the contract', AUTH)
  .addFlag('verify', 'Verifies contract storage against expected values')
  .addOptionalParam('multisig', 'Expected multisig address')
  .addOptionalParam('pendingowner', 'Expected pending owner', ZERO_ADDRESS)
  .setAction(async (taskArgs, { ethers, getNamedAccounts, run }) => {
    console.log('Querying contract deployed at:', taskArgs.address);
    const { deployer } = await getNamedAccounts();
    const target: Auth = await ethers.getContractAt(
      taskArgs.contractName,
      taskArgs.address,
      deployer,
    );

    const multisig = await target.multisig();
    const pendingOwner = await target.pendingOwner();

    console.log('multisig: ', multisig);
    console.log('pendingOwner: ', pendingOwner);

    if (taskArgs.verify) {
      const result = await run('auth-check:verify');
      exit(result);
    }
  });

subtask('auth-check:verify', 'Verify auth contract')
  .addParam('address', 'Auth contract address')
  .addParam('multisig', 'Expected multisig address')
  .addParam('pendingowner', 'Expected pending owner', ZERO_ADDRESS)
  .setAction(async (taskArgs, hre) => {
    console.log('Veryfing Auth contract');

    const res = await verify(
      {
        address: taskArgs.address,
        contractName: AUTH,
        properties: [
          ['multisig', taskArgs.multisig],
          ['pendingOwner', taskArgs.pendingowner],
        ],
      },
      hre,
    );

    if (res === 0) {
      console.log('Auth contract successfully verified! 👍');
    }

    return res;
  });
