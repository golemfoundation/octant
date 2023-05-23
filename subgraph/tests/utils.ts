import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as';

import { Locked as LockedEvent, Unlocked as UnlockedEvent } from '../generated/Deposits/Deposits';

export function createLockedEvent(
  depositBefore: BigInt,
  amount: BigInt,
  when: BigInt,
  user: Address,
): LockedEvent {
  // eslint-disable-next-line no-undef
  const lockedEvent = changetype<LockedEvent>(newMockEvent());

  lockedEvent.parameters = [];

  lockedEvent.parameters.push(
    new ethereum.EventParam('depositBefore', ethereum.Value.fromUnsignedBigInt(depositBefore)),
  );
  lockedEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)),
  );
  lockedEvent.parameters.push(
    new ethereum.EventParam('when', ethereum.Value.fromUnsignedBigInt(when)),
  );
  lockedEvent.parameters.push(new ethereum.EventParam('user', ethereum.Value.fromAddress(user)));

  return lockedEvent;
}

export function createUnlockedEvent(
  depositBefore: BigInt,
  amount: BigInt,
  when: BigInt,
  user: Address,
): UnlockedEvent {
  // eslint-disable-next-line no-undef
  const unlockedEvent = changetype<UnlockedEvent>(newMockEvent());

  unlockedEvent.parameters = [];

  unlockedEvent.parameters.push(
    new ethereum.EventParam('depositBefore', ethereum.Value.fromUnsignedBigInt(depositBefore)),
  );

  unlockedEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)),
  );
  unlockedEvent.parameters.push(
    new ethereum.EventParam('when', ethereum.Value.fromUnsignedBigInt(when)),
  );
  unlockedEvent.parameters.push(new ethereum.EventParam('user', ethereum.Value.fromAddress(user)));

  return unlockedEvent;
}

export function createBlockEvent(): ethereum.Block {
  return new ethereum.Block(
    Bytes.fromI32(1),
    Bytes.fromI32(1),
    Bytes.fromI32(1),
    Address.fromString('0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'),
    Bytes.fromI32(1),
    Bytes.fromI32(1),
    Bytes.fromI32(1),
    BigInt.fromI32(1),
    BigInt.fromI32(1),
    BigInt.fromI32(1),
    BigInt.fromI32(1),
    BigInt.fromI32(1),
    BigInt.fromI32(1),
    BigInt.fromI32(1),
    BigInt.fromI32(1),
  );
}
