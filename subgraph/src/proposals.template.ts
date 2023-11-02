import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';

import {
  requestCurrentEpoch,
  requestCurrentProposalsCID,
  requestProposalAddresses,
} from './contracts-utils';

import { SetCIDCall, SetProposalAddressesCall } from '../generated/Proposals/Proposals';
import { AllEpochsProjectsInfo, EpochProjectsInfo } from '../generated/schema';

const ALL_EPOCHS_PROJECT_INFO_VERSION = 0;
const EPOCH_1 = 1;

// eslint-disable-next-line no-template-curly-in-string
const epochsContractAddress = '${EPOCHS_CONTRACT_ADDRESS}';
// eslint-disable-next-line no-template-curly-in-string
const proposalsContractAddress = '${PROPOSALS_CONTRACT_ADDRESS}';

function getCurrentAddresses(epochNumber: number): Address[] | null {
  if (epochNumber > EPOCH_1) {
    // We assume the current Epoch is 2 or higher
    // Get the list of proposals addresses from the previous Epoch and assign it to the entity of the current Epoch
    const currentAddresses = requestProposalAddresses(proposalsContractAddress, epochNumber - 1);
    if (currentAddresses == null) {
      return null;
    }
    return currentAddresses;
  }
  // We assume we are in Epoch 1 and since the EpochProjectsInfo entity doesn't exist for current Epoch, the projects addresses list is still empty
  return [];
}

function createNewEpochProjectsInfo(
  epoch: BigInt,
  addresses: Address[],
  newCid: string,
): EpochProjectsInfo {
  const epochNumber = epoch.toI32();
  const epochAsId = Bytes.fromI32(epochNumber);

  const epochProjectsInfo = new EpochProjectsInfo(epochAsId);
  epochProjectsInfo.epoch = epochNumber;
  epochProjectsInfo.proposalsCid = newCid;
  // eslint-disable-next-line no-undef
  epochProjectsInfo.projectsAddresses = changetype<Bytes[]>(addresses);
  return epochProjectsInfo;
}

export function handleSetCID(call: SetCIDCall): void {
  const currentEpoch: BigInt | null = requestCurrentEpoch(epochsContractAddress);
  if (currentEpoch === null) {
    return;
  }

  const epochNumber = currentEpoch.toI32();
  const epochAsId = Bytes.fromI32(epochNumber);

  let epochProjectsInfo: EpochProjectsInfo | null = EpochProjectsInfo.load(epochAsId);
  if (epochProjectsInfo == null) {
    const currentAddresses: Address[] | null = getCurrentAddresses(epochNumber);
    if (currentAddresses == null) {
      return;
    }
    epochProjectsInfo = createNewEpochProjectsInfo(
      currentEpoch,
      currentAddresses,
      call.inputs._newCID,
    );
  } else {
    epochProjectsInfo.proposalsCid = call.inputs._newCID;
  }
  epochProjectsInfo.save();
}

export function handleSetProposalAddresses(call: SetProposalAddressesCall): void {
  const currentEpoch: BigInt | null = requestCurrentEpoch(epochsContractAddress);
  if (currentEpoch === null) {
    return;
  }

  const epochAsId = Bytes.fromI32(call.inputs._epoch.toI32());

  // Update a specific Epoch addresses list
  let epochProjectsInfo: EpochProjectsInfo | null = EpochProjectsInfo.load(epochAsId);
  if (epochProjectsInfo === null) {
    // We assume the EpochProjectsInfo entity doesn't exist for current Epoch, which means the CID hasn't been set for this Epoch yet, so we use the one set before
    const cid: string | null = requestCurrentProposalsCID(proposalsContractAddress);
    if (cid === null) {
      return;
    }
    epochProjectsInfo = createNewEpochProjectsInfo(
      currentEpoch,
      call.inputs._proposalAddresses,
      cid,
    );
  } else {
    // eslint-disable-next-line no-undef
    epochProjectsInfo.projectsAddresses = changetype<Bytes[]>(call.inputs._proposalAddresses);
  }
  epochProjectsInfo.save();

  // Update ALL Epochs addresses list
  let allEpochsProjectInfo: AllEpochsProjectsInfo | null = AllEpochsProjectsInfo.load(
    Bytes.fromI32(ALL_EPOCHS_PROJECT_INFO_VERSION),
  );
  if (allEpochsProjectInfo === null) {
    allEpochsProjectInfo = new AllEpochsProjectsInfo(
      Bytes.fromI32(ALL_EPOCHS_PROJECT_INFO_VERSION),
    );
    // eslint-disable-next-line no-undef
    allEpochsProjectInfo.projectsAddresses = changetype<Bytes[]>(call.inputs._proposalAddresses);
  } else {
    // eslint-disable-next-line no-undef
    const inputAddresses = changetype<Bytes[]>(call.inputs._proposalAddresses);
    const currentAddresses = allEpochsProjectInfo.projectsAddresses;
    for (let i = 0; i < inputAddresses.length; i++) {
      if (!currentAddresses.includes(inputAddresses[i])) {
        currentAddresses.push(inputAddresses[i]);
      }
    }
    allEpochsProjectInfo.projectsAddresses = currentAddresses;
  }
  allEpochsProjectInfo.save();
}
