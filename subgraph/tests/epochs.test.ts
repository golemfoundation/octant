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
const EPOCHS_ADDRESS = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

describe('Describe entity assertions', () => {
  afterAll(() => {
    clearStore();
    dataSourceMock.resetValues();
  });

  test('Epoch created and stored', () => {
    const contractAddress = Address.fromString(EPOCHS_ADDRESS);
    createMockedFunction(
      contractAddress,
      'getCurrentEpoch',
      'getCurrentEpoch():(uint256)',
    ).returns([ethereum.Value.fromI32(1)]);
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
    assert.fieldEquals(EPOCH_ENTITY_TYPE, '0x01000000', 'duration', '5000');
    assert.fieldEquals(EPOCH_ENTITY_TYPE, '0x01000000', 'decisionWindow', '2000');
    assert.fieldEquals(EPOCH_ENTITY_TYPE, '0x01000000', 'fromTs', '1000');
    assert.fieldEquals(EPOCH_ENTITY_TYPE, '0x01000000', 'toTs', '6000');
  });
});
