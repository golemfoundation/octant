import { Address, ethereum, Bytes, BigInt } from '@graphprotocol/graph-ts';


import { requestCurrentEpoch } from "../src/contracts-utils";

import { Epochs } from '../generated/Epochs/Epochs';
import { Epoch } from '../generated/schema';

export function handleBlock(block: ethereum.Block): void {
  const epochsContractAddress = '';
  const currentEpoch: BigInt | null = requestCurrentEpoch(epochsContractAddress);
  if (currentEpoch === null) {
    return;
  }

  const epochNo = currentEpoch.toI32();
  let epoch = Epoch.load(Bytes.fromI32(epochNo));
  if (epoch == null) {
    epoch = new Epoch(Bytes.fromI32(epochNo));

    const epochsContract = Epochs.bind(Address.fromString(epochsContractAddress));
    const decisionWindow = epochsContract.getDecisionWindow();
    const duration = epochsContract.getEpochDuration();
    const epochEnd = epochsContract.getCurrentEpochEnd();
    const epochStart = epochEnd.minus(duration);

    epoch.epoch = epochNo;
    epoch.fromTs = epochStart;
    epoch.toTs = epochEnd;
    epoch.duration = duration;
    epoch.decisionWindow = decisionWindow;

    epoch.save();
  }
}
