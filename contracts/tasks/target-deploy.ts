import { task } from 'hardhat/config';

/* eslint no-console: 0 */

task('target-deploy', 'Deploy Withdrawals Target contract to new address').setAction(
  async (_taskArgs, { deployments, getNamedAccounts }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
    const target = await deploy('WithdrawalsTarget', {
      from: deployer,
      log: true,
      proxy: {
        proxyContract: 'EIP173Proxy',
      },
    });
    console.log('Withdrawals target deployed at ', target.address);
  },
);
