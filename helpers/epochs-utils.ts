import { Epochs } from '../typechain-types';
import { increaseNextBlockTimestamp } from './misc-utils';

export async function forwardEpochs(epochs: Epochs, quantity: number) {
  let epochDuration = await epochs.epochDuration();
  let nextTimestamp = epochDuration.toNumber() * quantity;
  await increaseNextBlockTimestamp(nextTimestamp);
}
