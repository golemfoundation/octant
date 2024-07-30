import { ethers, network } from 'hardhat';
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

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

export async function getNamedSigners(): Promise<Record<string, SignerWithAddress>> {
  const { namedAccounts } = hre.config;
  const signers = await ethers.getSigners();

  const namedSigners: Record<string, SignerWithAddress> = {};

  for (const [name, accountConfig] of Object.entries(namedAccounts)) {
    let index: number | undefined;

    if (typeof accountConfig === 'number') {
      index = accountConfig;
    } else if (typeof accountConfig === 'object' && accountConfig !== null) {
      index = accountConfig[hre.network.name] ?? accountConfig['default'];
    }

    if (index !== undefined && index < signers.length) {
      namedSigners[name] = signers[index];
    }
  }

  return namedSigners;
}
