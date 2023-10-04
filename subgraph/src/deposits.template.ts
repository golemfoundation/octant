import { BigInt, BigDecimal } from '@graphprotocol/graph-ts';

import { Locked as LockedEvent, Unlocked as UnlockedEvent } from '../generated/Deposits/Deposits';
import { Locked, Unlocked, LockedSummaryLatest, LockedSummarySnapshot } from '../generated/schema';

export function addLockedSummary<T>(event: T): void {
  const totalSupply = BigInt.fromString('1000000000000000000000000000');

  // Load latest locked summary
  let latestLockedSummary = LockedSummaryLatest.load('latest');
  if (latestLockedSummary == null) {
    latestLockedSummary = new LockedSummaryLatest('latest');
    latestLockedSummary.lockedTotal = BigInt.fromI32(0);
    latestLockedSummary.lockedRatio = BigDecimal.fromString('0');
  }

  // Calculate total locked and locked ratio
  let lockedTotal: BigInt;
  if (event instanceof LockedEvent) {
    lockedTotal = latestLockedSummary.lockedTotal.plus(event.params.amount);
  } else if (event instanceof UnlockedEvent) {
    lockedTotal = latestLockedSummary.lockedTotal.minus(event.params.amount);
  } else {
    throw new Error('event must be of LockedEvent or UnlockEvent type');
  }
  const lockedRatio = lockedTotal.divDecimal(totalSupply.toBigDecimal());

  // Save LockedSummaryLatest
  latestLockedSummary.lockedTotal = lockedTotal;
  latestLockedSummary.lockedRatio = lockedRatio;
  latestLockedSummary.glmSupply = totalSupply;
  latestLockedSummary.blockNumber = event.block.number.toI32();
  latestLockedSummary.transactionHash = event.transaction.hash;
  latestLockedSummary.timestamp = event.block.timestamp.toI32();
  latestLockedSummary.save();

  // Save LockedSummarySnapshot
  const lockedSummarySnapshot = new LockedSummarySnapshot(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  lockedSummarySnapshot.lockedTotal = lockedTotal;
  lockedSummarySnapshot.lockedRatio = lockedRatio;
  lockedSummarySnapshot.glmSupply = totalSupply;
  lockedSummarySnapshot.blockNumber = event.block.number.toI32();
  lockedSummarySnapshot.transactionHash = event.transaction.hash;
  lockedSummarySnapshot.timestamp = event.block.timestamp.toI32();
  lockedSummarySnapshot.save();
}

export function handleLocked(event: LockedEvent): void {
  const lockedEntity = new Locked(event.transaction.hash.concatI32(event.logIndex.toI32()));
  lockedEntity.depositBefore = event.params.depositBefore;
  lockedEntity.amount = event.params.amount;
  lockedEntity.user = event.params.user;
  lockedEntity.blockNumber = event.block.number.toI32();
  lockedEntity.transactionHash = event.transaction.hash;
  lockedEntity.timestamp = event.block.timestamp.toI32();
  lockedEntity.save();

  addLockedSummary(event);
}

export function handleUnlocked(event: UnlockedEvent): void {
  const unlockedEntity = new Unlocked(event.transaction.hash.concatI32(event.logIndex.toI32()));
  unlockedEntity.depositBefore = event.params.depositBefore;
  unlockedEntity.amount = event.params.amount;
  unlockedEntity.user = event.params.user;
  unlockedEntity.blockNumber = event.block.number.toI32();
  unlockedEntity.transactionHash = event.transaction.hash;
  unlockedEntity.timestamp = event.block.timestamp.toI32();
  unlockedEntity.save();

  addLockedSummary(event);
}
