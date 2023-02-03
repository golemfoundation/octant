import {
  Deposited as DepositedEvent,
  Withdrawn as WithdrawnEvent,
} from '../generated/Deposits/Deposits';
import { Deposited, Withdrawn } from '../generated/schema';

export function handleDeposited(event: DepositedEvent): void {
  const entity = new Deposited(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.amount = event.params.amount;
  entity.user = event.params.depositor;

  entity.blockNumber = event.block.number.toI32();
  entity.blockTimestamp = event.block.timestamp.toI32();
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  const entity = new Withdrawn(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.amount = event.params.amount;
  entity.user = event.params.depositor;

  entity.blockNumber = event.block.number.toI32();
  entity.blockTimestamp = event.block.timestamp.toI32();
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
