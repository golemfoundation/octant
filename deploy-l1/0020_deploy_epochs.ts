import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DECISION_WINDOW, EPOCH_DURATION, EPOCHS_START } from '../env';
import { EPOCHS } from '../helpers/constants';
import { getCurrentBlockNumber } from '../helpers/misc-utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  let start = EPOCHS_START ? Number(EPOCHS_START) : await getCurrentBlockNumber();
  let decisionWindow = DECISION_WINDOW;
  let epochDuration = EPOCH_DURATION;
  if (hre.network.name === 'hardhat') {
    decisionWindow = 120;
    epochDuration = 300;
  }

  await deploy(EPOCHS, {
    from: deployer,
    log: true,
    args: [start, epochDuration, decisionWindow],
    autoMine: true,
  });
};
export default func;
func.tags = ['epochs', 'local', 'test', 'goerli'];
