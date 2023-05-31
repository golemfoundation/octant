import { expect } from 'chai';
import { BigNumber } from 'ethers';
import { ethers } from 'hardhat';

import { BatchDeposit } from '../typechain/typechain-types';


// Fake deposits
const fakeData = {
  creds: '0x00e53ca56e7f6412ca6024989d8a37cb0520d70d7e3472bf08fc629816603b5c',

  dataRoots:
    '0x2c16c5739ec31a951e5551e828ef57ee2d6944b36cf674db9f884173289c7946',

  pubkey:
    'b397443cf61fbb6286550d9ef9b58a033deeb0378fe504ec09978d94eb87aedea244892853b994e27d6f77133fce723e',

  signature:
    'a45d0dd7c44a73209d2377fbc3ded47e5af5ee38ade2e08c53551dd34b98248b8a1e1feb1912fb024033435927d47ad70adf10b1ee4a65bfc8ae1501962dee655bfeb5cefdff3389c2d9eadcc6fdc4e8ed340f0414b684168146c15aa4edbfed',
};

describe('BatchDeposit', async () => {
  let batchDeposit: BatchDeposit;

  beforeEach(async () => {
    const depositContractFactory = await ethers.getContractFactory('DepositContract');
    const depositContract = await depositContractFactory.deploy();
    const batchDepositFactory = await ethers.getContractFactory('BatchDeposit');
    batchDeposit = await batchDepositFactory.deploy(depositContract.address, 0);
  });

  const validatorsCount = 600;

  it(`can deposit ${validatorsCount} validators in one shot`, async () => {
    const amountEth = BigNumber.from(32 * validatorsCount);
    const amountWei = ethers.utils.parseEther(amountEth.toString());

    let pubkeys = '0x';
    let signatures = '0x';
    const dataRoots: string[] = [];

    for (let i = 0; i < validatorsCount; i++) {
      pubkeys += fakeData.pubkey;
      signatures += fakeData.signature;
      dataRoots.push(fakeData.dataRoots);
    }

    const tx = await batchDeposit.batchDeposit(
      pubkeys,
      fakeData.creds,
      signatures,
      dataRoots,
      {
        gasLimit: 20000000,
        value: amountWei
      }
    );

    const receipt = await tx.wait();

    expect(receipt.logs?.length).to.equal(validatorsCount + 1);
  });
});
