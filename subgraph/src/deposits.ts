import { Locked as LockedEvent, Unlocked as UnlockedEvent } from '../generated/Deposits/Deposits';
import { Locked, Unlocked } from '../generated/schema';

export function handleLocked(event: LockedEvent): void {
  const entity = new Locked(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.depositBefore = event.params.depositBefore;
  entity.amount = event.params.amount;
  entity.user = event.params.user;

  entity.blockNumber = event.block.number.toI32();
  entity.transactionHash = event.transaction.hash;
  entity.timestamp = event.block.timestamp.toI32();

  entity.save();
}

export function handleUnlocked(event: UnlockedEvent): void {
  const entity = new Unlocked(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.depositBefore = event.params.depositBefore;
  entity.amount = event.params.amount;
  entity.user = event.params.user;

  entity.blockNumber = event.block.number.toI32();
  entity.transactionHash = event.transaction.hash;
  entity.timestamp = event.block.timestamp.toI32();

  entity.save();
}
