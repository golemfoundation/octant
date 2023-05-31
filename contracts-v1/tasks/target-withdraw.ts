import { task } from 'hardhat/config';

import { PROXY_WITH_RECEIVE, WITHDRAWALS_TARGET } from '../helpers/constants';
import { EIP173ProxyWithReceive, IWithdrawalsTarget } from '../typechain';

/* eslint no-console: 0 */

task('target-withdraw', 'A quick-and-dirty way to withdraw funds from WT')
  .addParam('address', 'Address of the proxy')
  .addParam('contractName', 'Name of the implementation contract', WITHDRAWALS_TARGET)
  .addParam('amount', 'Amount in ETH. Acceptable values: 0.1, 10, etc')
  .setAction(async (taskArgs, { ethers }) => {
    const proxy: EIP173ProxyWithReceive = await ethers.getContractAt(
      PROXY_WITH_RECEIVE,
      taskArgs.address,
    );
    const proxyOwner = await proxy.owner();
    const target: IWithdrawalsTarget = await ethers.getContractAt(
      taskArgs.contractName,
      taskArgs.address,
    );
    const wei = ethers.utils.parseEther(taskArgs.amount.toString());
    const unsignedTx = await target.connect(proxyOwner).populateTransaction.withdraw(wei);
    console.log('Please execute following tx:', unsignedTx);
  });
