/* eslint-disable no-undef */
import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { afterEach, assert, clearStore, describe, newMockEvent, test } from 'matchstick-as';

import { Allocated as AllocatedEvent } from '../generated/Allocations/Allocations';
import { handleAllocated } from '../src/allocations';

const ALLOCATION_ENTITY_TYPE = 'Allocated';

export function createAllocatedEvent(
  epoch: i32,
  user: string,
  proposal: string,
  allocation: i32,
  logIndex: i32,
): AllocatedEvent {
  const allocatedEvent = changetype<AllocatedEvent>(newMockEvent());
  allocatedEvent.parameters = [];
  const epochParam = new ethereum.EventParam('epoch', ethereum.Value.fromI32(epoch));
  const userParam = new ethereum.EventParam(
    'user',
    ethereum.Value.fromAddress(Address.fromString(user)),
  );
  const allocationStructParam = new ethereum.EventParam(
    'allocation',
    ethereum.Value.fromTuple(
      changetype<ethereum.Tuple>([
        ethereum.Value.fromAddress(Address.fromString(proposal)),
        ethereum.Value.fromI32(allocation),
      ]),
    ),
  );

  allocatedEvent.parameters.push(epochParam);
  allocatedEvent.parameters.push(userParam);
  allocatedEvent.parameters.push(allocationStructParam);
  allocatedEvent.logIndex = BigInt.fromI32(logIndex);

  return allocatedEvent;
}

describe('Mocked Events', () => {
  afterEach(() => {
    clearStore();
  });

  test('Can add multiple allocations with proper fields', () => {
    const allocatedEvent1 = createAllocatedEvent(
      1,
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      100,
      1,
    );

    const allocatedEvent2 = createAllocatedEvent(
      1,
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
      '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
      9999,
      2,
    );

    handleAllocated(allocatedEvent1);
    handleAllocated(allocatedEvent2);

    assert.entityCount(ALLOCATION_ENTITY_TYPE, 2);
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'epoch',
      '1',
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'user',
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'.toLowerCase(),
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'proposal',
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'.toLowerCase(),
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'allocation',
      '100',
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockTimestamp',
      '1',
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockNumber',
      '1',
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'transactionHash',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    );

    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'epoch',
      '1',
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'user',
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'.toLowerCase(),
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'proposal',
      '0xdD2FD4581271e230360230F9337D5c0430Bf44C0'.toLowerCase(),
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'allocation',
      '9999',
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'blockTimestamp',
      '1',
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'blockNumber',
      '1',
    );
    assert.fieldEquals(
      ALLOCATION_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'transactionHash',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    );
  });
});
