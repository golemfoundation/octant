import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';


import {
  requestCurrentEpoch,
  requestCurrentProposalsCID,
  requestProposalAddresses,
} from "./contracts-utils";

import { SetCIDCall, SetProposalAddressesCall } from '../generated/Proposals/Proposals';
import { AccumulatedProjectsMetadata, EpochProjectsMetadata } from '../generated/schema';

const ALL_EPOCHS_PROJECT_INFO_VERSION = 0;
const EPOCH_1 = 1;

// eslint-disable-next-line no-template-curly-in-string
const epochsContractAddress = '${EPOCHS_CONTRACT_ADDRESS}';
// eslint-disable-next-line no-template-curly-in-string
const proposalsContractAddress = '${PROPOSALS_CONTRACT_ADDRESS}';

function getCurrentAddresses(epochNumber: BigInt): Address[] | null {
  const epoch = epochNumber.toI32();
  if (epoch > EPOCH_1) {
    // We assume the current Epoch is 2 or higher
    // Get the list of proposals addresses from the previous Epoch and assign it to the entity of the current Epoch
    const currentAddresses = requestProposalAddresses(
      proposalsContractAddress,
      epochNumber.minus(BigInt.fromI32(1)),
    );
    if (currentAddresses == null) {
      return null;
    }
    return currentAddresses;
  }
  // We assume we are in Epoch 1 and since the EpochProjectsMetadata entity doesn't exist for current Epoch, the projects addresses list is still empty
  return [];
}

function createNewEpochProjectsMetadata(
  epoch: BigInt,
  addresses: Address[],
  newCid: string,
): EpochProjectsMetadata {
  const epochNumber = epoch.toI32();
  const epochAsId = Bytes.fromI32(epochNumber);

  const epochProjectsMetadata = new EpochProjectsMetadata(epochAsId);
  epochProjectsMetadata.epoch = epochNumber;
  epochProjectsMetadata.proposalsCid = newCid;
  // eslint-disable-next-line no-undef
  epochProjectsMetadata.projectsAddresses = changetype<Bytes[]>(addresses);
  return epochProjectsMetadata;
}

export function handleSetCID(call: SetCIDCall): void {
  const currentEpoch: BigInt | null = requestCurrentEpoch(epochsContractAddress);
  if (currentEpoch === null) {
    return;
  }

  const epochAsId = Bytes.fromI32(currentEpoch.toI32());

  let epochProjectsMetadata: EpochProjectsMetadata | null = EpochProjectsMetadata.load(epochAsId);
  if (epochProjectsMetadata == null) {
    const currentAddresses: Address[] | null = getCurrentAddresses(currentEpoch);
    if (currentAddresses == null) {
      return;
    }
    epochProjectsMetadata = createNewEpochProjectsMetadata(
      currentEpoch,
      currentAddresses,
      call.inputs._newCID,
    );
  } else {
    epochProjectsMetadata.proposalsCid = call.inputs._newCID;
  }
  epochProjectsMetadata.save();
}

export function handleSetProposalAddresses(call: SetProposalAddressesCall): void {
  const epochAsId = Bytes.fromI32(call.inputs._epoch.toI32());

  // Update a specific Epoch addresses list
  let epochProjectsMetadata: EpochProjectsMetadata | null = EpochProjectsMetadata.load(epochAsId);
  if (epochProjectsMetadata === null) {
    // We assume the EpochProjectsMetadata entity doesn't exist for current Epoch, which means the CID hasn't been set for this Epoch yet, so we use the one set before
    const cid: string | null = requestCurrentProposalsCID(proposalsContractAddress);
    if (cid === null) {
      return;
    }
    epochProjectsMetadata = createNewEpochProjectsMetadata(
      call.inputs._epoch,
      call.inputs._proposalAddresses,
      cid,
    );
  } else {
    // eslint-disable-next-line no-undef
    epochProjectsMetadata.projectsAddresses = changetype<Bytes[]>(call.inputs._proposalAddresses);
  }
  epochProjectsMetadata.save();

  // Update ALL Epochs addresses list
  let accumulatedProjectsMetadata: AccumulatedProjectsMetadata | null = AccumulatedProjectsMetadata.load(
    Bytes.fromI32(ALL_EPOCHS_PROJECT_INFO_VERSION),
  );
  if (accumulatedProjectsMetadata === null) {
    accumulatedProjectsMetadata = new AccumulatedProjectsMetadata(
      Bytes.fromI32(ALL_EPOCHS_PROJECT_INFO_VERSION),
    );
    // eslint-disable-next-line no-undef
    accumulatedProjectsMetadata.projectsAddresses = changetype<Bytes[]>(
      call.inputs._proposalAddresses,
    );
  } else {
    // eslint-disable-next-line no-undef
    const inputAddresses = changetype<Bytes[]>(call.inputs._proposalAddresses);
    const currentAddresses = accumulatedProjectsMetadata.projectsAddresses;
    for (let i = 0; i < inputAddresses.length; i++) {
      if (!currentAddresses.includes(inputAddresses[i])) {
        currentAddresses.push(inputAddresses[i]);
      }
    }
    accumulatedProjectsMetadata.projectsAddresses = currentAddresses;
  }
  accumulatedProjectsMetadata.save();
}
