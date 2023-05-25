import { network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { MULTISIG_ADDRESS } from '../env';
import { PROXY_WITH_RECEIVE, WITHDRAWALS_TARGET } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer, TestFoundation } = await hre.getNamedAccounts();
  const multisig = network.live ? MULTISIG_ADDRESS : TestFoundation;

  // This is proxied contract deployment/upgrade.
  await deploy(WITHDRAWALS_TARGET, {
    autoMine: true,
    contract: WITHDRAWALS_TARGET,
    from: deployer,
    log: true,
    proxy: {
      execute: {
        args: [multisig],
        methodName: 'initialize',
      },
      // only owner can perform upgrades of the proxy
      owner: multisig,
      proxyContract: PROXY_WITH_RECEIVE,
    },
  });
};
export default func;
func.tags = ['local', 'test', 'testnet', 'withdrawals-target'];
