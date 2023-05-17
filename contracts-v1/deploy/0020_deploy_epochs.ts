import { ethers } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { DECISION_WINDOW, EPOCH_DURATION } from '../env';
import { AUTH, EPOCHS } from '../helpers/constants';
import { getLatestBlockTimestamp } from '../helpers/misc-utils';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  const start = await getLatestBlockTimestamp();
  let decisionWindow = DECISION_WINDOW;
  let epochDuration = EPOCH_DURATION;
  if (['hardhat', 'localhost'].includes(hre.network.name)) {
    decisionWindow = 120;
    epochDuration = 300;
  }

  const auth = await ethers.getContract(AUTH);

  await deploy(EPOCHS, {
    args: [start, epochDuration, decisionWindow, auth.address],
    autoMine: true,
    from: deployer,
    log: true,
  });
};
export default func;
func.tags = ['epochs', 'local', 'test', 'testnet'];
