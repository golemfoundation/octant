import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as';

import { Locked as LockedEvent, Unlocked as UnlockedEvent } from '../generated/Deposits/Deposits';

export function createLockedEvent(amount: BigInt, when: BigInt, user: Address): LockedEvent {
  // eslint-disable-next-line no-undef
  const lockedEvent = changetype<LockedEvent>(newMockEvent());

  lockedEvent.parameters = [];

  lockedEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)),
  );
  lockedEvent.parameters.push(
    new ethereum.EventParam('when', ethereum.Value.fromUnsignedBigInt(when)),
  );
  lockedEvent.parameters.push(new ethereum.EventParam('user', ethereum.Value.fromAddress(user)));

  return lockedEvent;
}

export function createUnlockedEvent(amount: BigInt, when: BigInt, user: Address): UnlockedEvent {
  // eslint-disable-next-line no-undef
  const unlockedEvent = changetype<UnlockedEvent>(newMockEvent());

  unlockedEvent.parameters = [];

  unlockedEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)),
  );
  unlockedEvent.parameters.push(
    new ethereum.EventParam('when', ethereum.Value.fromUnsignedBigInt(when)),
  );
  unlockedEvent.parameters.push(new ethereum.EventParam('user', ethereum.Value.fromAddress(user)));

  return unlockedEvent;
}
