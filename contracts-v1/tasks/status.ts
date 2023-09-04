import { formatEther } from 'ethers/lib/utils';
import { task } from 'hardhat/config';

/* eslint no-console: 0 */
import { DEPOSITS, EPOCHS } from '../helpers/constants';
import { Deposits, Epochs } from '../typechain';

task('status', "Octant's status").setAction(async (taskArgs, { ethers }) => {
  const epochs: Epochs = await ethers.getContract(EPOCHS);
  const block = await ethers.provider.getBlock('latest');
  console.log(`Block: ${block.number}; Timestamp: ${block.timestamp}`);
  const now = block.timestamp;
  if (epochs) {
    console.log(`Epochs at: ${epochs.address}`);
    const nextEpochAt = (await epochs.getCurrentEpochEnd()).toNumber();
    console.log('Current epoch :', (await epochs.getCurrentEpoch()).toNumber());
    console.log('Epoch duration:', (await epochs.getEpochDuration()).toNumber(), 'sec');
    console.log('Sec until next:', nextEpochAt - now, 'sec');
  } else {
    console.log('Epochs contract address unknown');
  }
  const deposits: Deposits = await ethers.getContract(DEPOSITS);
  if (deposits) {
    console.log(`Deposits at: ${deposits.address}`);
    const { Alice } = await ethers.getNamedSigners();
    console.log('Alice deposit value:', formatEther(await deposits.deposits(Alice.address)), 'wei');
  }
});
