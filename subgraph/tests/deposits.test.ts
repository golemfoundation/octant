import { Address, BigInt } from '@graphprotocol/graph-ts';
import { afterAll, assert, beforeAll, clearStore, describe, test } from 'matchstick-as';

import { createLockedEvent, createUnlockedEvent } from './utils';

import { handleLocked, handleUnlocked } from '../src/deposits';

const LOCK_ENTITY_TYPE = 'Locked';
const UNLOCK_ENTITY_TYPE = 'Unlocked';

describe('Describe entity assertions', () => {
  beforeAll(() => {
    const amount = BigInt.fromI32(234);
    const when = BigInt.fromI32(234);
    const user = Address.fromString('0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199');
    const lockedEvent = createLockedEvent(amount, when, user);
    const unlockedEvent = createUnlockedEvent(amount, when, user);
    handleLocked(lockedEvent);
    handleUnlocked(unlockedEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test('Locked created and stored', () => {
    assert.entityCount(LOCK_ENTITY_TYPE, 1);
    assert.fieldEquals(
      LOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'amount',
      '234',
    );
    assert.fieldEquals(
      LOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'user',
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'.toLowerCase(),
    );
    assert.fieldEquals(
      LOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockTimestamp',
      '1',
    );
    assert.fieldEquals(
      LOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockNumber',
      '1',
    );
    assert.fieldEquals(
      LOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'transactionHash',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    );
  });

  test('Unlocked created and stored', () => {
    assert.entityCount(UNLOCK_ENTITY_TYPE, 1);
    assert.fieldEquals(
      UNLOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'amount',
      '234',
    );
    assert.fieldEquals(
      UNLOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'user',
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'.toLowerCase(),
    );
    assert.fieldEquals(
      UNLOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockTimestamp',
      '1',
    );
    assert.fieldEquals(
      UNLOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockNumber',
      '1',
    );
    assert.fieldEquals(
      UNLOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'transactionHash',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    );
  });
});
