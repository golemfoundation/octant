import { Address, ethereum, log } from '@graphprotocol/graph-ts';

import { Epochs } from '../generated/Epochs/Epochs';
import { Epoch } from '../generated/schema';

export function handleBlock(block: ethereum.Block): void {
  // TODO pass the address from config OCT-467
  const epochsContract = Epochs.bind(
    Address.fromString('0x456F0802243A14C3b5F55B943A57acf64Ac82531'),
  );
  const currentEpoch = epochsContract.try_getCurrentEpoch();
  if (currentEpoch.reverted) {
    log.info('Call to getCurrentEpoch() reverted!', []);
    return;
  }

  let epoch = Epoch.load(currentEpoch.value.toString());
  if (epoch == null) {
    epoch = new Epoch(currentEpoch.value.toString());

    const decisionWindow = epochsContract.getDecisionWindow();
    const duration = epochsContract.getEpochDuration();
    const epochEnd = epochsContract.getCurrentEpochEnd();
    const epochStart = epochEnd.minus(duration);

    epoch.fromTs = epochStart.toI32();
    epoch.toTs = epochEnd.toI32();
    epoch.duration = duration.toI32();
    epoch.decisionWindow = decisionWindow.toI32();

    epoch.save();
  }
}
