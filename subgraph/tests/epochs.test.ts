import { Address, ethereum } from '@graphprotocol/graph-ts';
import {
  afterAll,
  assert,
  clearStore,
  createMockedFunction,
  dataSourceMock,
  describe,
  test,
} from 'matchstick-as';

import { createBlockEvent } from './utils';

import { handleBlock } from '../src/epochs';

const EPOCH_ENTITY_TYPE = 'Epoch';
const EPOCHS_ADDRESS = '0x456F0802243A14C3b5F55B943A57acf64Ac82531';

describe('Describe entity assertions', () => {
  afterAll(() => {
    clearStore();
    dataSourceMock.resetValues();
  });

  test('Epoch created and stored', () => {
    const contractAddress = Address.fromString(EPOCHS_ADDRESS);
    createMockedFunction(contractAddress, 'getCurrentEpoch', 'getCurrentEpoch():(uint32)').returns([
      ethereum.Value.fromI32(1),
    ]);
    createMockedFunction(
      contractAddress,
      'getDecisionWindow',
      'getDecisionWindow():(uint256)',
    ).returns([ethereum.Value.fromI32(2000)]);
    createMockedFunction(
      contractAddress,
      'getEpochDuration',
      'getEpochDuration():(uint256)',
    ).returns([ethereum.Value.fromI32(5000)]);
    createMockedFunction(
      contractAddress,
      'getCurrentEpochEnd',
      'getCurrentEpochEnd():(uint256)',
    ).returns([ethereum.Value.fromI32(6000)]);

    const blockEvent = createBlockEvent();
    handleBlock(blockEvent);

    assert.entityCount(EPOCH_ENTITY_TYPE, 1);
    assert.fieldEquals(EPOCH_ENTITY_TYPE, '1', 'duration', '5000');
    assert.fieldEquals(EPOCH_ENTITY_TYPE, '1', 'decisionWindow', '2000');
    assert.fieldEquals(EPOCH_ENTITY_TYPE, '1', 'fromTs', '1000');
    assert.fieldEquals(EPOCH_ENTITY_TYPE, '1', 'toTs', '6000');
  });
});
