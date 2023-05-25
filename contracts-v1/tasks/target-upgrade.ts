import { task } from 'hardhat/config';

import { WITHDRAWALS_TARGET } from '../helpers/constants';

/* eslint no-console: 0 */

task('target-upgrade', 'Upgrade Withdrawals Target contract')
  .addParam('address', 'Address of the proxy')
  .addParam('contractName', 'Name of the contract with new implementation', WITHDRAWALS_TARGET)
  .setAction(async (taskArgs, { deployments, getNamedAccounts }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    console.log('deployer is', deployer);
    console.log('Contract name is', taskArgs.contractName);
    const res = await deploy(WITHDRAWALS_TARGET, {
      contract: taskArgs.contractName,
      from: deployer,
      proxy: true,
    });
    console.log('Args: ', res.args);
    console.log('Implementation lib at: ', res.implementation);
    console.log('Newly deployed: ', res.newlyDeployed);
  });
