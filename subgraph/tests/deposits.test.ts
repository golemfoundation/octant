import { Address, BigInt } from '@graphprotocol/graph-ts';
import { afterAll, assert, beforeAll, clearStore, describe, test } from 'matchstick-as';

import { createDepositedEvent, createWithdrawnEvent } from './utils';

import { handleDeposited, handleWithdrawn } from '../src/deposits';

const DEPOSIT_ENTITY_TYPE = 'Deposited';
const WITHDRAWAL_ENTITY_TYPE = 'Withdrawn';

describe('Describe entity assertions', () => {
  beforeAll(() => {
    const amount = BigInt.fromI32(234);
    const when = BigInt.fromI32(234);
    const depositor = Address.fromString('0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199');
    const depositedEvent = createDepositedEvent(amount, when, depositor);
    const withdrawnEvent = createWithdrawnEvent(amount, when, depositor);
    handleDeposited(depositedEvent);
    handleWithdrawn(withdrawnEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test('Deposited created and stored', () => {
    assert.entityCount(DEPOSIT_ENTITY_TYPE, 1);
    assert.fieldEquals(
      DEPOSIT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'amount',
      '234',
    );
    assert.fieldEquals(
      DEPOSIT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'user',
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'.toLowerCase(),
    );
    assert.fieldEquals(
      DEPOSIT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockTimestamp',
      '1',
    );
    assert.fieldEquals(
      DEPOSIT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockNumber',
      '1',
    );
    assert.fieldEquals(
      DEPOSIT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'transactionHash',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    );
  });

  test('Withdrawn created and stored', () => {
    assert.entityCount(WITHDRAWAL_ENTITY_TYPE, 1);
    assert.fieldEquals(
      WITHDRAWAL_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'amount',
      '234',
    );
    assert.fieldEquals(
      WITHDRAWAL_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'user',
      '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'.toLowerCase(),
    );
    assert.fieldEquals(
      WITHDRAWAL_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockTimestamp',
      '1',
    );
    assert.fieldEquals(
      WITHDRAWAL_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockNumber',
      '1',
    );
    assert.fieldEquals(
      WITHDRAWAL_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'transactionHash',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    );
  });
});
