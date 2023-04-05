import { formatEther, parseEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';

import { PROPOSAL_ADDRESSES } from '../env';
import { EPOCHS, REWARDS, ALLOCATIONS } from '../helpers/constants';
import { Epochs, Rewards, Allocations } from '../typechain';

/* eslint no-console: 0 */

task('allocate', 'Perform allocation of funds')
  .addParam('custom', 'Custom allocation: INDEX,ETH_FLOAT[;INDEX,ETH_FLOAT]', '1,0.0001;2,0.000012')
  .setAction(async (taskArgs, { ethers }) => {
    const { Alice } = await ethers.getNamedSigners();
    const epochs: Epochs = await ethers.getContract(EPOCHS);
    const now = await epochs.getCurrentEpoch();
    console.log(`Epoch: ${now}`);
    const isOpen = await epochs.isDecisionWindowOpen();
    console.log(`Decision window open: ${isOpen}`);
    const rewards: Rewards = await ethers.getContract(REWARDS);
    const aliceEpochReward = ethers.utils.formatEther(
      await rewards.individualReward(now - 1, Alice.address),
    );
    console.log(`Alice reward at epoch ${now - 1} is ${aliceEpochReward} ETH`);
    if (!isOpen) {
      console.log('Decision window is closed, exiting');
    }
    const allocations: Allocations = await ethers.getContract(ALLOCATIONS);
    let total = parseEther('0');
    const votes = taskArgs.custom.split(';').map((pair: string) => {
      const [index, vote] = pair.split(',');
      total = total.add(parseEther(vote));
      return { allocation: parseEther(vote), proposal: PROPOSAL_ADDRESSES[Number(index)] };
    });
    console.log(`Total ETH allocation from Alice is ${formatEther(total)}`);
    await allocations.connect(Alice).allocate(votes);
  });
