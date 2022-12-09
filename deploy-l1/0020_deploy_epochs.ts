import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { DECISION_WINDOW, EPOCH_DURATION, EPOCHS_START } from '../env';
import { EPOCHS } from '../helpers/constants';
import { getCurrentBlockNumber } from '../helpers/misc-utils';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deploy } = hre.deployments;
  const { deployer } = await hre.getNamedAccounts();

  let start = EPOCHS_START ? Number(EPOCHS_START) : await getCurrentBlockNumber();

  await deploy(EPOCHS, {
    from: deployer,
    log: true,
    args: [start, EPOCH_DURATION, DECISION_WINDOW],
    autoMine: true,
  });
};
export default func;
func.tags = ['epochs', 'local', 'test', 'goerli'];
