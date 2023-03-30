import { ethers, network } from 'hardhat';

export async function getLatestBlockTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock('latest');
  return block.timestamp;
}

export async function increaseNextBlockTimestamp(sec: number): Promise<void> {
  await network.provider.send('evm_increaseTime', [sec]);
  await network.provider.send('evm_mine');
}

export async function setNextBlockTimestamp(timestamp: number): Promise<void> {
  await network.provider.send('evm_setNextBlockTimestamp', [timestamp]);
  await network.provider.send('evm_mine');
}
