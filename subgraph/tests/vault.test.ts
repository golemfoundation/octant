import { Address, BigInt } from '@graphprotocol/graph-ts';
import { afterAll, assert, beforeAll, clearStore, describe, test } from 'matchstick-as';

import { createWithdrawnEvent } from './utils';

import { handleWithdrawn } from '../src/vault';

const WITHDRAWAL_ENTITY_TYPE = 'Withdrawal';

describe('Describe entity assertions', () => {
  beforeAll(() => {
    const amount = BigInt.fromI32(42424242);
    const epoch = 3;
    const user = Address.fromString('0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199');
    const withdrawnEvent = createWithdrawnEvent(amount, user, epoch);
    handleWithdrawn(withdrawnEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test('Withdrawal test', () => {
    assert.entityCount(WITHDRAWAL_ENTITY_TYPE, 1);
    assert.fieldEquals(
      WITHDRAWAL_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'amount',
      '42424242',
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
      'epoch',
      '3',
    );
    assert.fieldEquals(
      WITHDRAWAL_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'timestamp',
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
