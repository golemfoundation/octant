import { ethers } from 'hardhat';

import { WithdrawalsTarget } from '../typechain';

export async function sendETH(target: WithdrawalsTarget, amount: number): Promise<void> {
  const { deployer } = await ethers.getNamedSigners();
  await deployer.sendTransaction({
    to: target.address,
    value: ethers.utils.parseEther(amount.toString()),
  });
}
