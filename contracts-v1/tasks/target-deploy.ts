import { task } from 'hardhat/config';

import { PROXY_WITH_RECEIVE, WITHDRAWALS_TARGET } from '../helpers/constants';

/* eslint no-console: 0 */

task('target-deploy', 'Deploy Withdrawals Target contract to new address')
  .addParam('owner', 'Address of the proxy owner')
  .addParam('contractName', 'Name of the contract', WITHDRAWALS_TARGET)
  .setAction(async (taskArgs, { deployments, getNamedAccounts }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const target = await deploy(taskArgs.contractName, {
      from: deployer,
      log: true,
      proxy: {
        execute: {
          args: [taskArgs.owner],
          methodName: 'initialize',
        },
        // only owner can perform upgrades of the proxy
        owner: taskArgs.owner,
        proxyContract: PROXY_WITH_RECEIVE,
      },
    });
    console.log('Withdrawals target deployed at ', target.address);
  });
