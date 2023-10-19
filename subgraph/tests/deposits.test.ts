import { Address, BigInt } from '@graphprotocol/graph-ts';
import { afterAll, assert, beforeAll, clearStore, describe, test } from 'matchstick-as';

import { createLockedEvent, createUnlockedEvent } from './utils';

import { handleLocked, handleUnlocked } from '../generated/deposits';

const LOCK_ENTITY_TYPE = 'Locked';
const UNLOCK_ENTITY_TYPE = 'Unlocked';
const LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE = 'LockedSummarySnapshot';
const LOCK_SUMMARY_LATEST_ENTITY_TYPE = 'LockedSummaryLatest';

describe('Describe entity assertions', () => {
  beforeAll(() => {
    const lockedBefore = BigInt.fromString('100000000000000000000');
    const unlockedBefore = BigInt.fromString('400000000000000000000');
    const locked = BigInt.fromString('300000000000000000000');
    const unlocked = BigInt.fromString('200000000000000000000');
    const when = BigInt.fromString('234000000000000000000');
    const user = Address.fromString('0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199');
    const lockedEvent = createLockedEvent(lockedBefore, locked, when, user);
    const unlockedEvent = createUnlockedEvent(unlockedBefore, unlocked, when, user);
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
      'depositBefore',
      '100000000000000000000',
    );
    assert.fieldEquals(
      LOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'amount',
      '300000000000000000000',
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
      'timestamp',
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
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'depositBefore',
      '400000000000000000000',
    );
    assert.fieldEquals(
      UNLOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'amount',
      '200000000000000000000',
    );
    assert.fieldEquals(
      UNLOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'user',
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'.toLowerCase(),
    );
    assert.fieldEquals(
      UNLOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'timestamp',
      '1',
    );
    assert.fieldEquals(
      UNLOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'blockNumber',
      '1',
    );
    assert.fieldEquals(
      UNLOCK_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'transactionHash',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    );
  });

  test('Locked summary snapshot created and stored', () => {
    assert.entityCount(LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE, 2);
    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'lockedTotal',
      '300000000000000000000',
    );
    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'lockedRatio',
      '0.0000003',
    );
    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'glmSupply',
      '1000000000000000000000000000',
    );
    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'timestamp',
      '1',
    );
    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockNumber',
      '1',
    );
    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'transactionHash',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    );

    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'lockedTotal',
      '100000000000000000000',
    );
    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'lockedRatio',
      '0.0000001',
    );
    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'glmSupply',
      '1000000000000000000000000000',
    );
    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'timestamp',
      '1',
    );
    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'blockNumber',
      '1',
    );
    assert.fieldEquals(
      LOCK_SUMMARY_SNAPSHOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a02000000',
      'transactionHash',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    );
  });

  test('Latest locked summary created and stored', () => {
    assert.entityCount(LOCK_SUMMARY_LATEST_ENTITY_TYPE, 1);
    assert.fieldEquals(
      LOCK_SUMMARY_LATEST_ENTITY_TYPE,
      'latest',
      'lockedTotal',
      '100000000000000000000',
    );
    assert.fieldEquals(LOCK_SUMMARY_LATEST_ENTITY_TYPE, 'latest', 'lockedRatio', '0.0000001');
    assert.fieldEquals(
      LOCK_SUMMARY_LATEST_ENTITY_TYPE,
      'latest',
      'glmSupply',
      '1000000000000000000000000000',
    );
    assert.fieldEquals(LOCK_SUMMARY_LATEST_ENTITY_TYPE, 'latest', 'timestamp', '1');
    assert.fieldEquals(LOCK_SUMMARY_LATEST_ENTITY_TYPE, 'latest', 'blockNumber', '1');
    assert.fieldEquals(
      LOCK_SUMMARY_LATEST_ENTITY_TYPE,
      'latest',
      'transactionHash',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    );
  });
});
