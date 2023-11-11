import { Address, ethereum, Bytes, BigInt } from '@graphprotocol/graph-ts';

// eslint-disable-next-line import/no-useless-path-segments

import { requestCurrentEpoch } from "./contracts-utils";

import { Epochs } from '../generated/Epochs/Epochs';
import { Epoch } from '../generated/schema';

export function handleBlock(block: ethereum.Block): void {
  // eslint-disable-next-line no-template-curly-in-string
  const epochsContractAddress = '${EPOCHS_CONTRACT_ADDRESS}';
  const currentEpoch: BigInt | null = requestCurrentEpoch(epochsContractAddress);
  if (currentEpoch === null) {
    return;
  }

  const epochNumber = currentEpoch.toI32();
  let epoch = Epoch.load(Bytes.fromI32(epochNumber));
  if (epoch == null) {
    epoch = new Epoch(Bytes.fromI32(epochNumber));

    const epochsContract = Epochs.bind(Address.fromString(epochsContractAddress));
    const decisionWindow = epochsContract.getDecisionWindow();
    const duration = epochsContract.getEpochDuration();
    const epochEnd = epochsContract.getCurrentEpochEnd();
    const epochStart = epochEnd.minus(duration);

    epoch.epoch = epochNumber;
    epoch.fromTs = epochStart;
    epoch.toTs = epochEnd;
    epoch.duration = duration;
    epoch.decisionWindow = decisionWindow;

    epoch.save();
  }
}
