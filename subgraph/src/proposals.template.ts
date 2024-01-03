import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';

import { SetCIDCall, SetProposalAddressesCall } from '../generated/Proposals/Proposals';
import { ProjectsMetadataAccumulated, ProjectsMetadataPerEpoch } from '../generated/schema';
import {
  requestCurrentEpoch,
  requestCurrentProposalsCID,
  requestProposalAddresses,
  // eslint-disable-next-line import/no-useless-path-segments
} from '../src/contracts-utils';

const ALL_EPOCHS_PROJECT_INFO_VERSION = 0;

// eslint-disable-next-line no-template-curly-in-string
const epochsContractAddress = '${EPOCHS_CONTRACT_ADDRESS}';
// eslint-disable-next-line no-template-curly-in-string
const proposalsContractAddress = '${PROPOSALS_CONTRACT_ADDRESS}';

function getCurrentAddresses(epochNumber: BigInt): Address[] | null {
  const currentAddresses = requestProposalAddresses(proposalsContractAddress, epochNumber);
  if (currentAddresses == null) {
    return null;
  }
  return currentAddresses;
}

function createNewProjectsMetadataPerEpoch(
  epoch: BigInt,
  addresses: Address[],
  newCid: string,
): ProjectsMetadataPerEpoch {
  const epochNumber = epoch.toI32();
  const epochAsId = Bytes.fromI32(epochNumber);

  const projectsMetadataPerEpoch = new ProjectsMetadataPerEpoch(epochAsId);
  projectsMetadataPerEpoch.epoch = epochNumber;
  projectsMetadataPerEpoch.proposalsCid = newCid;
  // eslint-disable-next-line no-undef
  projectsMetadataPerEpoch.projectsAddresses = changetype<Bytes[]>(addresses);
  return projectsMetadataPerEpoch;
}

export function handleSetCID(call: SetCIDCall): void {
  const currentEpoch: BigInt | null = requestCurrentEpoch(epochsContractAddress);
  if (currentEpoch === null) {
    return;
  }

  const epochAsId = Bytes.fromI32(currentEpoch.toI32());

  let projectsMetadataPerEpoch: ProjectsMetadataPerEpoch | null = ProjectsMetadataPerEpoch.load(
    epochAsId,
  );
  if (projectsMetadataPerEpoch == null) {
    const currentAddresses: Address[] | null = getCurrentAddresses(currentEpoch);
    if (currentAddresses == null) {
      return;
    }
    projectsMetadataPerEpoch = createNewProjectsMetadataPerEpoch(
      currentEpoch,
      currentAddresses,
      call.inputs._newCID,
    );
  } else {
    projectsMetadataPerEpoch.proposalsCid = call.inputs._newCID;
  }
  projectsMetadataPerEpoch.save();
}

export function handleSetProposalAddresses(call: SetProposalAddressesCall): void {
  const epochAsId = Bytes.fromI32(call.inputs._epoch.toI32());

  // Update a specific Epoch addresses list
  let projectsMetadataPerEpoch: ProjectsMetadataPerEpoch | null = ProjectsMetadataPerEpoch.load(
    epochAsId,
  );
  if (projectsMetadataPerEpoch === null) {
    // We assume the ProjectsMetadataPerEpoch entity doesn't exist for current Epoch, which means the CID hasn't been set for this Epoch yet, so we use the one set before
    const cid: string | null = requestCurrentProposalsCID(proposalsContractAddress);
    if (cid === null) {
      return;
    }
    projectsMetadataPerEpoch = createNewProjectsMetadataPerEpoch(
      call.inputs._epoch,
      call.inputs._proposalAddresses,
      cid,
    );
  } else {
    // eslint-disable-next-line no-undef
    projectsMetadataPerEpoch.projectsAddresses = changetype<Bytes[]>(
      call.inputs._proposalAddresses,
    );
  }
  projectsMetadataPerEpoch.save();

  // Update ALL Epochs addresses list
  let projectsMetadataAccumulated: ProjectsMetadataAccumulated | null = ProjectsMetadataAccumulated.load(
    Bytes.fromI32(ALL_EPOCHS_PROJECT_INFO_VERSION),
  );
  if (projectsMetadataAccumulated === null) {
    projectsMetadataAccumulated = new ProjectsMetadataAccumulated(
      Bytes.fromI32(ALL_EPOCHS_PROJECT_INFO_VERSION),
    );
    // eslint-disable-next-line no-undef
    projectsMetadataAccumulated.projectsAddresses = changetype<Bytes[]>(
      call.inputs._proposalAddresses,
    );
  } else {
    // eslint-disable-next-line no-undef
    const inputAddresses = changetype<Bytes[]>(call.inputs._proposalAddresses);
    const currentAddresses = projectsMetadataAccumulated.projectsAddresses;
    for (let i = 0; i < inputAddresses.length; i++) {
      if (!currentAddresses.includes(inputAddresses[i])) {
        currentAddresses.push(inputAddresses[i]);
      }
    }
    projectsMetadataAccumulated.projectsAddresses = currentAddresses;
  }
  projectsMetadataAccumulated.save();
}
