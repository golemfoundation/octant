import { Address, BigInt, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { newMockEvent, createMockedFunction } from 'matchstick-as';

import { Locked as LockedEvent, Unlocked as UnlockedEvent } from '../generated/Deposits/Deposits';
import { Withdrawn } from '../generated/Vault/Vault';

export const GLM_ADDRESS = Address.fromString('0x71432DD1ae7DB41706ee6a22148446087BdD0906');
export const GNT_ADDRESS = Address.fromString('0xE6de13D64F6036E4E3f5fC84B5EB620C5C7c1050');

export function createLockedEvent(
  depositBefore: BigInt,
  amount: BigInt,
  when: BigInt,
  user: Address,
): LockedEvent {
  // eslint-disable-next-line no-undef
  const lockedEvent = changetype<LockedEvent>(newMockEvent());

  lockedEvent.logIndex = BigInt.fromI32(1);

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

  unlockedEvent.logIndex = BigInt.fromI32(2);

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

// eslint-disable-next-line no-undef
export function createWithdrawnEvent(amount: BigInt, user: Address, epoch: i32): Withdrawn {
  // eslint-disable-next-line no-undef
  const withdrawnEvent = changetype<Withdrawn>(newMockEvent());

  withdrawnEvent.parameters = [];

  withdrawnEvent.parameters.push(new ethereum.EventParam('user', ethereum.Value.fromAddress(user)));

  withdrawnEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)),
  );
  withdrawnEvent.parameters.push(new ethereum.EventParam('epoch', ethereum.Value.fromI32(epoch)));

  return withdrawnEvent;
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

export function mockGLMAndGNT(): void {
  // Mock GLM
  createMockedFunction(GLM_ADDRESS, 'totalSupply', 'totalSupply():(uint256)').returns([
    ethereum.Value.fromSignedBigInt(BigInt.fromString('627708950807659352199701196')),
  ]);
  createMockedFunction(GLM_ADDRESS, 'balanceOf', 'balanceOf(address):(uint256)')
    .withArgs([
      ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000000')),
    ])
    .returns([ethereum.Value.fromI32(1000)]);

  // Mock GNT
  createMockedFunction(GNT_ADDRESS, 'totalSupply', 'totalSupply():(uint256)').returns([
    ethereum.Value.fromSignedBigInt(BigInt.fromString('372291049192340647800298804')),
  ]);
  createMockedFunction(GNT_ADDRESS, 'balanceOf', 'balanceOf(address):(uint256)')
    .withArgs([
      ethereum.Value.fromAddress(Address.fromString('0x0000000000000000000000000000000000000000')),
    ])
    .returns([ethereum.Value.fromI32(2000)]);
}
