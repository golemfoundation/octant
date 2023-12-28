import { parseEther } from 'ethers/lib/utils';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

import { PROPOSALS_ADDRESSES } from '../env';
import { EPOCHS, PROPOSALS, WITHDRAWALS_TARGET } from '../helpers/constants';
import { Epochs, Proposals, WithdrawalsTarget } from '../typechain';

// This function needs to be declared this way, otherwise it's not understood by test runner.
// eslint-disable-next-line func-names
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  if (['hardhat'].includes(hre.network.name)) {
    // Test setup
    const { TestFoundation } = await hre.ethers.getNamedSigners();
    const epochs: Epochs = await hre.ethers.getContract(EPOCHS);
    const proposals: Proposals = await hre.ethers.getContract(PROPOSALS);

    const unnamedAddresses = await hre.getUnnamedAccounts();
    const proposalAddresses = unnamedAddresses.slice(0, 10);
    await proposals.connect(TestFoundation).setEpochs(epochs.address);
    await proposals.connect(TestFoundation).setProposalAddresses(1, proposalAddresses);
  } else if (['sepolia', 'goerli', 'localhost'].includes(hre.network.name)) {
    // Testnet and localhost networks setup
    const { TestFoundation } = await hre.ethers.getNamedSigners();
    const epochs: Epochs = await hre.ethers.getContract(EPOCHS);
    const proposals: Proposals = await hre.ethers.getContract(PROPOSALS);

    const proposalAddresses = PROPOSALS_ADDRESSES.split(',');
    await proposals.connect(TestFoundation).setProposalAddresses(1, proposalAddresses);
    await proposals.connect(TestFoundation).setEpochs(epochs.address);

    const target: WithdrawalsTarget = await hre.ethers.getContract(WITHDRAWALS_TARGET);
    await TestFoundation.sendTransaction({ to: target.address, value: parseEther('0.01') });
  } else if (hre.network.name === 'mainnet') {
    // Mainnet setup
  }
};

export default func;
func.tags = ['setup', 'local', 'test', 'testnet'];
