import { ethers, network } from 'hardhat';

export async function getLatestBlockTimestamp() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

export async function increaseNextBlockTimestamp(sec: number) {
  await network.provider.send('evm_increaseTime', [sec]);
  await network.provider.send('evm_mine');
}
