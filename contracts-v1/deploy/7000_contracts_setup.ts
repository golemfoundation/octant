import { parseEther } from 'ethers/lib/utils';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { EPOCHS, PROPOSALS, WITHDRAWALS_TARGET } from '../helpers/constants';
import { Epochs, Proposals, WithdrawalsTarget } from '../typechain';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (['hardhat', 'localhost'].includes(hre.network.name)) {
    // Test networks setup
    const { TestFoundation } = await hre.ethers.getNamedSigners();
    const epochs: Epochs = await hre.ethers.getContract(EPOCHS);
    const proposals: Proposals = await hre.ethers.getContract(PROPOSALS);
    await proposals.connect(TestFoundation).setEpochs(epochs.address);
  } else if (['sepolia', 'goerli'].includes(hre.network.name)) {
    // Testnet networks setup
    const { deployer } = await hre.ethers.getNamedSigners();
    const epochs: Epochs = await hre.ethers.getContract(EPOCHS);
    const proposals: Proposals = await hre.ethers.getContract(PROPOSALS);
    await proposals.connect(deployer).setEpochs(epochs.address);

    const target: WithdrawalsTarget = await hre.ethers.getContract(WITHDRAWALS_TARGET);
    await deployer.sendTransaction({ to: target.address, value: parseEther('0.0001') });
  } else if (hre.network.name === 'mainnet') {
    // Mainnet setup
  }
};

export default func;
func.tags = ['setup', 'local', 'test', 'testnet'];
