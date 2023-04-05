import { task } from 'hardhat/config';

import { EPOCHS, REWARDS, TOKEN } from '../helpers/constants';
import { Epochs, Rewards, Token } from '../typechain';

/* eslint no-console: 0 */

task('status', 'Display some basic information about state of deployed contracts').setAction(
  async (taskArgs, { ethers }) => {
    const { Alice } = await ethers.getNamedSigners();
    const epochs: Epochs = await ethers.getContract(EPOCHS);
    const currentEpoch = await epochs.getCurrentEpoch();
    const epochEnd: number = (await epochs.getCurrentEpochEnd()).toNumber();
    const isOpen = await epochs.isDecisionWindowOpen();
    const block = await ethers.provider.getBlock('latest');
    console.log(`Block: ${block.number}; Timestamp: ${block.timestamp}`);
    console.log(
      `Epoch: ${currentEpoch}. Can vote: ${isOpen}. Time until end of epoch: ${
        epochEnd - block.timestamp
      } seconds`,
    );
    const rewards: Rewards = await ethers.getContract(REWARDS);
    const token: Token = await ethers.getContract(TOKEN);
    const epochRewards = ethers.utils.formatEther(
      await rewards.allIndividualRewards(currentEpoch - 1),
    );
    const aliceEpochReward = ethers.utils.formatEther(
      await rewards.individualReward(currentEpoch - 1, Alice.address),
    );
    const aliceGLMBalance = await token.balanceOf(Alice.address);
    console.log(`All Individual Rewards at epoch ${currentEpoch - 1} are ${epochRewards} ETH`);
    console.log('Alice is', Alice.address);
    console.log(`Alice reward at epoch ${currentEpoch - 1} is ${aliceEpochReward} ETH`);
    console.log(`Alice GLM (${token.address}) balance is ${aliceGLMBalance}`);
  },
);
