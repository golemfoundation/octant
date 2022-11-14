import { ethers, network } from 'hardhat';

export async function getCurrentBlockNumber() {
  return await ethers.provider.getBlockNumber();
}

export async function mineBlocks(quantity: number) {
  await network.provider.send('hardhat_mine', [`0x${quantity.toString(16)}`]);
}
