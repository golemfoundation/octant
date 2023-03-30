import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { GOLEM_FOUNDATION_MULTISIG } from '../env';
import { PAYOUTS, PAYOUTS_MANAGER, PROPOSALS } from '../helpers/constants';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer, TestFoundation } = await hre.getNamedAccounts();

  const payouts = await ethers.getContract(PAYOUTS);
  const proposals = await ethers.getContract(PROPOSALS);

  let golemFoundationWithdrawalAddress = GOLEM_FOUNDATION_MULTISIG;

  if (hre.network.name === 'hardhat') {
    golemFoundationWithdrawalAddress = TestFoundation;
  }

  await deploy(PAYOUTS_MANAGER, {
    args: [payouts.address, golemFoundationWithdrawalAddress, proposals.address],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['payouts', 'local', 'test', 'goerli'];
