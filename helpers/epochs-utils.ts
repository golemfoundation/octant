import { Epochs } from '../typechain-types';
import { mineBlocks } from './misc-utils';

export async function forwardEpochs(epochs: Epochs, quantity: number) {
  let epochDuration = await epochs.epochDuration();
  let blockQuantity = epochDuration.toNumber() * quantity;
  await mineBlocks(blockQuantity);
}
