import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { MULTISIG_ADDRESS } from '../env';
import { AUTH } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer, TestFoundation } = await hre.getNamedAccounts();

  let multisig = MULTISIG_ADDRESS;

  if (['hardhat', 'localhost'].includes(hre.network.name)) {
    multisig = TestFoundation;
  }
  await deploy(AUTH, {
    args: [multisig],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['epoch1', 'auth', 'local', 'test', 'testnet'];
