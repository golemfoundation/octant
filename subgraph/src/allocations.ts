import { Allocated as AllocatedEvent } from '../generated/Allocations/Allocations';
import { Allocated } from '../generated/schema';

export function handleAllocated(event: AllocatedEvent): void {
  let entity = Allocated.load(event.transaction.hash.concatI32(event.logIndex.toI32()));
  if (!entity) {
    entity = new Allocated(event.transaction.hash.concatI32(event.logIndex.toI32()));
  }

  entity.epoch = event.params.epoch.toI32();
  entity.user = event.params.user;
  entity.proposal = event.params.allocation.proposal;
  entity.allocation = event.params.allocation.allocation;

  entity.blockNumber = event.block.number.toI32();
  entity.timestamp = event.block.timestamp.toI32();
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
