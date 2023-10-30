import { Address, BigInt } from '@graphprotocol/graph-ts';
import { afterAll, assert, beforeAll, clearStore, describe, test } from 'matchstick-as';

import { createWithdrawnEvent, createMerkleRootSetEvent } from './utils';

import { handleWithdrawn, handleMerkleRootSet } from '../generated/vault';

const WITHDRAWAL_ENTITY_TYPE = 'Withdrawal';
const MERKLE_ROOT_ENTITY_TYPE = 'VaultMerkleRoot';

describe('Withdrawals', () => {
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

  test('Test add entity when new event occurs', () => {
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

describe('Merkle root', () => {
  beforeAll(() => {
    const epoch = 1;
    const merkleRoot = '0x422a0c21e83cbb3f32430d924b5cb4f40b4e2a0bf8e053a3da0e2ed85d1ab4ea';
    const merkleRootSetEvent = createMerkleRootSetEvent(epoch, merkleRoot);
    handleMerkleRootSet(merkleRootSetEvent);
  });

  afterAll(() => {
    clearStore();
  });

  test('Test add entity when new event occurs', () => {
    assert.entityCount(MERKLE_ROOT_ENTITY_TYPE, 1);
    assert.fieldEquals(
      MERKLE_ROOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'root',
      '0x422a0c21e83cbb3f32430d924b5cb4f40b4e2a0bf8e053a3da0e2ed85d1ab4ea',
    );
    assert.fieldEquals(
      MERKLE_ROOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'epoch',
      '1',
    );
    assert.fieldEquals(
      MERKLE_ROOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'timestamp',
      '1',
    );
    assert.fieldEquals(
      MERKLE_ROOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'blockNumber',
      '1',
    );
    assert.fieldEquals(
      MERKLE_ROOT_ENTITY_TYPE,
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a01000000',
      'transactionHash',
      '0xa16081f360e3847006db660bae1c6d1b2e17ec2a',
    );
  });
});
