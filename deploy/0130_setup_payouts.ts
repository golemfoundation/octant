import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { GOERLI_WITHDRAWALS_TARGET } from '../env';
import { PAYOUTS_MANAGER, WITHDRAWALS_TARGET } from '../helpers/constants';
import { PayoutsManager, WithdrawalsTarget } from '../typechain-types';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  let targetAddress = GOERLI_WITHDRAWALS_TARGET;
  if (hre.network.name === 'hardhat') {
    const target = await ethers.getContract(WITHDRAWALS_TARGET);
    targetAddress = target.address;
  }
  const manager: PayoutsManager = await ethers.getContract(PAYOUTS_MANAGER);
  await manager.setTarget(targetAddress);

  const target: WithdrawalsTarget = await ethers.getContractAt(WITHDRAWALS_TARGET, targetAddress);
  await target.setHexagon(manager.address);
};
export default func;
func.tags = ['payouts', 'local', 'test', 'goerli'];
