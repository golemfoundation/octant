import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { EPOCHS, PROPOSALS } from '../helpers/constants';
import { Epochs, Proposals } from '../typechain';

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
  }
};

export default func;
func.tags = ['setup', 'local', 'test', 'testnet'];
