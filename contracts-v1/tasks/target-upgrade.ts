import { task } from 'hardhat/config';

import { PROXY_WITH_RECEIVE, WITHDRAWALS_TARGET } from '../helpers/constants';
import { EIP173ProxyWithReceive } from '../typechain';

/* eslint no-console: 0 */

task('target-upgrade', 'Upgrade Withdrawals Target contract')
  .addParam('address', 'Address of the proxy')
  .addParam('contractName', 'Name of the contract with new implementation', WITHDRAWALS_TARGET)
  .setAction(async (taskArgs, { ethers, deployments, getNamedAccounts }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    console.log('Deployer is', deployer);
    console.log('Deployed implementation lib name is', taskArgs.contractName);
    const res = await deploy(taskArgs.contractName, {
      contract: taskArgs.contractName,
      from: deployer,
    });
    console.log('Implementation lib at: ', res.address);
    const proxy: EIP173ProxyWithReceive = await ethers.getContractAt(
      PROXY_WITH_RECEIVE,
      taskArgs.address,
    );
    const unsignedTx = await proxy.populateTransaction.upgradeTo(res.address);
    console.log('Please execute following tx:', unsignedTx);
  });
