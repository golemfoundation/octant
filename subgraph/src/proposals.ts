import { Bytes } from '@graphprotocol/graph-ts';

import { SetProposalAddressesCall } from '../generated/Proposals/Proposals';
import { EpochProjectsInfo } from '../generated/schema';

export function handleSetProposalAddresses(call: SetProposalAddressesCall): void {
  const epochAsId = Bytes.fromByteArray(Bytes.fromBigInt(call.inputs._epoch));
  let epochProjects: EpochProjectsInfo | null = EpochProjectsInfo.load(epochAsId);
  if (epochProjects === null) {
    epochProjects = new EpochProjectsInfo(epochAsId);
    epochProjects.epoch = call.inputs._epoch.toI32();
    // eslint-disable-next-line no-undef
    epochProjects.projectsAddresses = changetype<Bytes[]>(call.inputs._proposalAddresses);
  } else {
    // eslint-disable-next-line no-undef
    epochProjects.projectsAddresses = changetype<Bytes[]>(call.inputs._proposalAddresses);
  }
  epochProjects.save();
}
