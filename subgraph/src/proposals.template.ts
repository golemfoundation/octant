import { Bytes } from '@graphprotocol/graph-ts';

import { SetProposalAddressesCall } from '../generated/Proposals/Proposals';
import { AllEpochsProjectsInfo, EpochProjectsInfo } from '../generated/schema';

const ALL_EPOCHS_PROJECT_INFO_VERSION = 0;

export function handleSetProposalAddresses(call: SetProposalAddressesCall): void {
  // Update a specific Epoch addresses list
  const epochAsId = Bytes.fromByteArray(Bytes.fromBigInt(call.inputs._epoch));
  let epochProjectsInfo: EpochProjectsInfo | null = EpochProjectsInfo.load(epochAsId);
  if (epochProjectsInfo === null) {
    epochProjectsInfo = new EpochProjectsInfo(epochAsId);
    epochProjectsInfo.epoch = call.inputs._epoch.toI32();
    // eslint-disable-next-line no-undef
    epochProjectsInfo.projectsAddresses = changetype<Bytes[]>(call.inputs._proposalAddresses);
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
