import { Address, BigInt, log } from '@graphprotocol/graph-ts';

import { Epochs } from '../generated/Epochs/Epochs';
import { Proposals } from '../generated/Proposals/Proposals';

export function requestCurrentEpoch(epochsContractAddress: string): BigInt | null {
  const epochsContract = Epochs.bind(Address.fromString(epochsContractAddress));

  const currentEpoch = epochsContract.try_getCurrentEpoch();
  if (currentEpoch.reverted) {
    log.info('Call to getCurrentEpoch() reverted!', []);
    return null;
  }
  return currentEpoch.value;
}

export function requestProposalAddresses(
  proposalsContractsAddress: string,
  epochNumber: number,
): Address[] | null {
  const proposalsContract = Proposals.bind(Address.fromString(proposalsContractsAddress));

  const currentAddresses = proposalsContract.try_getProposalAddresses(BigInt.fromI32(epochNumber));
  if (currentAddresses.reverted) {
    log.info('Call to getProposalAddresses() reverted!', []);
    return null;
  }
  return currentAddresses.value;
}

export function requestCurrentProposalsCID(proposalsContractsAddress: string): string | null {
  const proposalsContract = Proposals.bind(Address.fromString(proposalsContractsAddress));

  const cid = proposalsContract.try_cid();
  if (cid.reverted) {
    log.info('Call to cid() reverted!', []);
    return null;
  }
  return cid.value;
}
