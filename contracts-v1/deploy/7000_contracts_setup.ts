import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { AUTH, EPOCHS, PROPOSALS } from '../helpers/constants';
import { Auth, Epochs, Proposals } from '../typechain';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (['hardhat', 'localhost'].includes(hre.network.name)) {
    // Test networks setup
    // TODO automate the flow for testnet deployment - OCT-364
    const { TestFoundation } = await hre.ethers.getNamedSigners();
    const epochs: Epochs = await hre.ethers.getContract(EPOCHS);
    const proposals: Proposals = await hre.ethers.getContract(PROPOSALS);
    await proposals.connect(TestFoundation).setEpochs(epochs.address);
  } else {
    // Live networks setup
    // Renounce deployer role
    const auth: Auth = await hre.ethers.getContract(AUTH);
    await auth.renounceDeployer();
  }
};

export default func;
func.tags = ['epoch1', 'setup', 'local', 'test', 'testnet'];
