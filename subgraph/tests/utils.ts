import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { newMockEvent } from 'matchstick-as';

import {
  Deposited as DepositedEvent,
  Withdrawn as WithdrawnEvent,
} from '../generated/Deposits/Deposits';

export function createDepositedEvent(
  amount: BigInt,
  when: BigInt,
  depositor: Address,
): DepositedEvent {
  // eslint-disable-next-line no-undef
  const depositedEvent = changetype<DepositedEvent>(newMockEvent());

  depositedEvent.parameters = [];

  depositedEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)),
  );
  depositedEvent.parameters.push(
    new ethereum.EventParam('when', ethereum.Value.fromUnsignedBigInt(when)),
  );
  depositedEvent.parameters.push(
    new ethereum.EventParam('depositor', ethereum.Value.fromAddress(depositor)),
  );

  return depositedEvent;
}

export function createWithdrawnEvent(
  amount: BigInt,
  when: BigInt,
  depositor: Address,
): WithdrawnEvent {
  // eslint-disable-next-line no-undef
  const withdrawnEvent = changetype<WithdrawnEvent>(newMockEvent());

  withdrawnEvent.parameters = [];

  withdrawnEvent.parameters.push(
    new ethereum.EventParam('amount', ethereum.Value.fromUnsignedBigInt(amount)),
  );
  withdrawnEvent.parameters.push(
    new ethereum.EventParam('when', ethereum.Value.fromUnsignedBigInt(when)),
  );
  withdrawnEvent.parameters.push(
    new ethereum.EventParam('depositor', ethereum.Value.fromAddress(depositor)),
  );

  return withdrawnEvent;
}
