import { task } from 'hardhat/config';

/* eslint no-console: 0 */

task('target-upgrade', 'Upgrade Withdrawals Target contract')
  .addParam('address', 'Address of the proxy', '0x6D699Cb950cc1e33D25C179F67DF6a688EaCd0a3')
  .addParam('filename', 'Filename of library to be deployed', 'WithdrawalsTarget')
  .setAction(async (taskArgs, { deployments, getNamedAccounts }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    console.log('deployer is', deployer);
    console.log('filename is', taskArgs.filename);
    const res = await deploy('WithdrawalsTarget', {
      contract: taskArgs.filename,
      from: deployer,
      proxy: {
        proxyContract: 'EIP173Proxy',
      },
    });
    console.log('Args? ', res.args);
    console.log('Implementation lib at? ', res.implementation);
    console.log('Newly deployed? ', res.newlyDeployed);
  });
