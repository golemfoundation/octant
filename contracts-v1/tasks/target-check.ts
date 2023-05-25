import { task } from 'hardhat/config';

/* eslint no-console: 0 */
import { WITHDRAWALS_TARGET } from '../helpers/constants';
import { WithdrawalsTarget } from '../typechain';

task('target-check', 'Check version of target at particular addres')
  .addParam('address', 'Address of the proxy')
  .addParam('contractName', 'Name of the contract', WITHDRAWALS_TARGET)
  .setAction(async (taskArgs, { ethers, getNamedAccounts }) => {
    console.log('Querying contract deployed at:', taskArgs.address);
    const { deployer } = await getNamedAccounts();
    const target: WithdrawalsTarget = await ethers.getContractAt(
      taskArgs.contractName,
      taskArgs.address,
      deployer,
    );
    console.log('version: ', (await target.version()).toNumber());
  });
