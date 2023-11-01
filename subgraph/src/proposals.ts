import { Bytes } from '@graphprotocol/graph-ts';

import { SetProposalAddressesCall } from '../generated/Proposals/Proposals';
import { EpochProjects } from '../generated/schema';

export function handleSetProposalAddresses(call: SetProposalAddressesCall): void {
  const epochAsId = Bytes.fromByteArray(Bytes.fromBigInt(call.inputs._epoch));
  let epochProjects: EpochProjects | null = EpochProjects.load(epochAsId);
  if (epochProjects === null) {
    epochProjects = new EpochProjects(epochAsId);
    epochProjects.epoch = call.inputs._epoch.toI32();
    // eslint-disable-next-line no-undef
    epochProjects.projectsAddresses = changetype<Bytes[]>(call.inputs._proposalAddresses);
  } else {
    // eslint-disable-next-line no-undef
    epochProjects.projectsAddresses = changetype<Bytes[]>(call.inputs._proposalAddresses);
  }
  epochProjects.save();
}
