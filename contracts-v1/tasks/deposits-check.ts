import { subtask, task } from 'hardhat/config';
import { exit } from 'process';

/* eslint no-console: 0 */
import { verify } from './verification/verifiable';

import { GLM_ADDRESS } from '../env';
import { DEPOSITS } from '../helpers/constants';
import { Deposits } from '../typechain';

task('deposits-check', 'Check deposits at particular addres')
  .addParam('address', 'Deposits contract address')
  .addParam('contractName', 'Name of the contract', DEPOSITS)
  .addFlag('verify', 'Verifies contract storage against expected values')
  .addOptionalParam('auth', 'Expected Auth contract address')
  .addOptionalParam('glm', 'Expected GLM contract address')
  .setAction(async (taskArgs, { ethers, getNamedAccounts, run }) => {
    console.log('Querying contract deployed at:', taskArgs.address);
    const { deployer } = await getNamedAccounts();
    const target: Deposits = await ethers.getContractAt(
      taskArgs.contractName,
      taskArgs.address,
      deployer,
    );

    const auth = await target.auth();
    const glm = await target.glm();

    console.log('auth: ', auth);
    console.log('glm: ', glm);

    if (taskArgs.verify) {
      const result = await run('deposits-check:verify', taskArgs);
      exit(result);
    }
  });

subtask('deposits-check:verify', 'Verify deposits contract')
  .addParam('address', 'Deposits contract address')
  .addParam('auth', 'Expected Auth contract address')
  .addParam('glm', 'Expected GLM contract address', GLM_ADDRESS)
  .setAction(async (taskArgs, hre) => {
    console.log('Veryfing Deposits contract');

    const res = await verify(
      {
        address: taskArgs.address,
        contractName: DEPOSITS,
        properties: [
          ['auth', taskArgs.auth],
          ['glm', taskArgs.glm],
        ],
      },
      hre,
    );

    if (res === 0) {
      console.log('Deposits contract successfully verified! 👍');
    }

    return res;
  });
