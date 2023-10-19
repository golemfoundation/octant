import axios from 'axios';
import { task } from 'hardhat/config';

import { EPOCHS } from '../helpers/constants';
import { Epochs } from '../typechain';

/* eslint no-console: 0 */

task(
  'next-epoch',
  'Forward to the beginning of the epoch, do a snapshots (no withdrawals funding implemented yet)',
).setAction(async (taskArgs, { ethers, network }) => {
  let now;
  let req;
  if (network.name !== 'localhost') {
    console.log("This script will work only with 'localhost' network");
    console.log('This script also assumes that backend is running locally');
    process.exitCode = 1;
    return;
  }
  const epochs: Epochs = await ethers.getContract(EPOCHS);
  if (!epochs) {
    console.log("Can't determine Epochs contract address, exiting");
    process.exitCode = 1;
    return;
  }
  now = (await ethers.provider.getBlock('latest')).timestamp;
  const nextEpochAt = (await epochs.getCurrentEpochEnd()).toNumber();
  const epochDuration = (await epochs.getEpochDuration()).toNumber();

  // there must be at least one PES before first FES, thus call it just in case
  // now it is safe to call pending
  req = await axios.post('http://localhost:5000/snapshots/pending');
  console.log(`Pending epoch snapshot creation status: ${req.status}`);

  // trigger finalized snapshot
  const decisionWindow = (await epochs.getDecisionWindow()).toNumber();
  const votingEndAt = nextEpochAt - epochDuration + decisionWindow;
  if (now < votingEndAt) {
    await network.provider.send('evm_increaseTime', [votingEndAt - now + 1]);
    await network.provider.send('evm_mine');
  }
  // ! make sure subgraph has indexed new epoch before calling backend
  do {
    // eslint-disable-next-line no-await-in-loop
    req = await axios.get('http://localhost:5000/epochs/indexed');
  } while (req.data.indexedEpoch !== undefined && req.data.indexedEpoch !== req.data.currentEpoch);
  // ! now it is safe to call finalized
  req = await axios.post('http://localhost:5000/snapshots/finalized');
  console.log(`Finalized epoch snapshot creation status: ${req.status}`);
  now = (await ethers.provider.getBlock('latest')).timestamp;

  // create pending epoch snapshot
  const toForward = nextEpochAt - now;
  console.log(`Forwarding chain time ${toForward}s and mining a block`);
  await network.provider.send('evm_increaseTime', [toForward]);
  await network.provider.send('evm_mine');
  const newEpoch = (await epochs.getCurrentEpoch()).toNumber();
  console.log(`New epoch: ${newEpoch}`);
  do {
    // eslint-disable-next-line no-await-in-loop
    req = await axios.get('http://localhost:5000/epochs/indexed');
  } while (req.data.indexedEpoch !== undefined && req.data.indexedEpoch !== req.data.currentEpoch);
  req = await axios.post('http://localhost:5000/snapshots/pending');
  console.log(`Pending epoch snapshot creation status: ${req.status}`);
});
