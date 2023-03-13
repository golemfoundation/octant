import { increaseNextBlockTimestamp } from './misc-utils';

import { Epochs } from '../typechain-types';

export async function forwardEpochs(epochs: Epochs, quantity: number): Promise<void> {
  const epochDuration = await epochs.getEpochDuration();
  const nextTimestamp = epochDuration.toNumber() * quantity;
  await increaseNextBlockTimestamp(nextTimestamp);
}

export async function forwardAfterDecisionWindow(epochs: Epochs): Promise<void> {
  const dwDuration = await epochs.getDecisionWindow();
  const nextTimestamp = dwDuration.toNumber();
  await increaseNextBlockTimestamp(nextTimestamp);
}
