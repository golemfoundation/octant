import { ethers, network } from 'hardhat';

import { GOERLI_DEPOSIT_CONTRACT_ADDRESS, MAINNET_DEPOSIT_CONTRACT_ADDRESS } from '../env';

/* eslint-disable no-console */

async function main() {
  console.log(`Deploying BatchDeposit to ${network.name} network...`);

  const fee = 0;
  let depositContractAddress = GOERLI_DEPOSIT_CONTRACT_ADDRESS;
  if (network.name === 'mainnet') {
    depositContractAddress = MAINNET_DEPOSIT_CONTRACT_ADDRESS;
  }
  if (['hardhat', 'localhost'].includes(network.name)) {
    const DepositContractFactory = await ethers.getContractFactory('DepositContract');
    const depositContract = await DepositContractFactory.deploy();
    console.log(`DepositContract deployed to ${depositContract.address}`);

    depositContractAddress = depositContract.address;
  }
  const BatchDepositFactory = await ethers.getContractFactory('BatchDeposit');
  const batchDeposit = await BatchDepositFactory.deploy(depositContractAddress, fee, {});

  console.log(`Batch deposit deployed to ${batchDeposit.address}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
