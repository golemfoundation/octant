import { network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { GOLEM_FOUNDATION_MULTISIG } from '../env';
import { WITHDRAWALS_TARGET } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  // Q: why TARGET and contract are both specified?
  // A: This is proxied contract deployment/upgrade.
  //    This way we can have explicitely named contracts with versions attached in names.
  //    This in turn allows us to test them all at the same time in unit tests.
  //    E.g. "WTv1", "WTv2", etc
  await deploy(WITHDRAWALS_TARGET, {
    args: [],
    autoMine: true,
    contract: 'WithdrawalsTarget',
    from: deployer,
    log: true,
    // proxy on the testnet, not upgradeable otherwise:
    proxy: network.live
      ? false
      : {
          // owner set to GFMS means that upgrade can only be performed by multisig
          owner: network.live ? GOLEM_FOUNDATION_MULTISIG : deployer,
          proxyContract: 'EIP173Proxy',
        },
  });
};
export default func;
func.tags = ['target', 'local', 'test'];
