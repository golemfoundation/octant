import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { DECISION_WINDOW, EPOCH_DURATION, EPOCHS_START } from '../env';
import { EPOCHS } from '../helpers/constants';
import { getLatestBlockTimestamp } from '../helpers/misc-utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  let start = EPOCHS_START;
  if (hre.network.name === 'hardhat') {
    start = await getLatestBlockTimestamp() + 1;
  }

  await deploy(EPOCHS, {
    from: deployer,
    log: true,
    args: [start, EPOCH_DURATION, DECISION_WINDOW],
    autoMine: true,
  });
};
export default func;
func.tags = ['epochs', 'local', 'test', 'goerli'];
