import { task } from 'hardhat/config';

import { EPOCHS, OCTANT_ORACLE, WITHDRAWALS_TARGET } from '../helpers/constants';
import { Epochs, OctantOracle, WithdrawalsTarget } from '../typechain';

/* eslint no-console: 0 */

task('target-fund', 'Send some funds to WithdrawalsTarget, simulating ETH staking rewards')
  .addParam('address', 'Address of the proxy')
  .addParam('amount', 'Amount in ethers', '1.0')
  .setAction(async (taskArgs, { ethers, network }) => {
    const { deployer } = await ethers.getNamedSigners();
    if (network.name !== 'localhost') {
      console.log('This script will work only with localhost network');
      return;
    }
    const octantOracle: OctantOracle = await ethers.getContract(OCTANT_ORACLE);
    const epochs: Epochs = await ethers.getContract(EPOCHS);
    const target: WithdrawalsTarget = await ethers.getContract(WITHDRAWALS_TARGET);
    await deployer.sendTransaction({
      to: target.address,
      value: ethers.utils.parseEther(taskArgs.amount),
    });

    const epochDuration = await epochs.getEpochDuration();
    const nextTimestamp = epochDuration.toNumber();
    await network.provider.send('evm_increaseTime', [nextTimestamp]);
    await network.provider.send('evm_mine');

    await octantOracle.writeBalance();
  });
