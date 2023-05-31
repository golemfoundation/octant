import fs from 'fs';
import { ethers } from 'hardhat';
import { BATCH_DEPOSIT_CONTRACT_ADDRESS, DEPOSIT_DATA_FILE } from '../env';
import { BatchDeposit } from '../typechain/typechain-types';

/* eslint-disable no-console */

// Define the ABI
const batchingABI = JSON.parse(fs.readFileSync('artifacts/contracts/BatchDeposit.sol/BatchDeposit.json', 'utf-8')).abi;

const providerEthers = ethers.providers.getDefaultProvider();
const batchDeposit = new ethers.Contract(BATCH_DEPOSIT_CONTRACT_ADDRESS, batchingABI, providerEthers) as BatchDeposit;

// Read deposit depositData from a file
const rawdata = fs.readFileSync(DEPOSIT_DATA_FILE, 'utf-8');
const depositData = JSON.parse(rawdata);

const batchDepositInput = {
  creds: '',
  dataRoots: [],
  pubkeys: '',
  signatures: '',
};

// Transform depositData
depositData.forEach((item: any, index: any) => {
  batchDepositInput.pubkeys += item.pubkey;
  batchDepositInput.signatures += item.signature;
  batchDepositInput.dataRoots.push(`0x${item.deposit_data_root}`);
  if (index === 0) {
    batchDepositInput.creds = item.withdrawal_credentials;
  }
});

batchDepositInput.pubkeys = `0x${batchDepositInput.pubkeys}`;
batchDepositInput.creds = `0x${batchDepositInput.creds}`;
batchDepositInput.signatures = `0x${batchDepositInput.signatures}`;
console.log('Batch deposit input: ', batchDepositInput);

const value = ethers.utils.parseEther((32 * depositData.length).toString());

const txData = batchDeposit.interface.encodeFunctionData(
  'batchDeposit',
  [
    batchDepositInput.pubkeys,
    batchDepositInput.creds,
    batchDepositInput.signatures,
    batchDepositInput.dataRoots
  ]
);

console.log('to: ', BATCH_DEPOSIT_CONTRACT_ADDRESS);
console.log('value: ', ethers.utils.formatEther(value));
console.log('txData: ', txData);
