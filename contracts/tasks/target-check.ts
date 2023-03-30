import { task } from 'hardhat/config';

/* eslint no-console: 0 */

import { WITHDRAWALS_TARGET } from '../helpers/constants';
import { WithdrawalsTarget } from '../typechain-types';

task('target-check', 'Check version of target at particular addres')
  .addParam('address', 'Address of the proxy', '0x6D699Cb950cc1e33D25C179F67DF6a688EaCd0a3')
  .setAction(async (taskArgs, { ethers, getNamedAccounts }) => {
    console.log('Querying contract deployed at:', taskArgs.address);
    const { deployer } = await getNamedAccounts();
    const target: WithdrawalsTarget = await ethers.getContractAt(
      WITHDRAWALS_TARGET,
      taskArgs.address,
      deployer,
    );
    console.log('version: ', (await target.version()).toNumber());
    console.log('octant: ', await target.octant());
  });
