import { Withdrawal } from '../generated/schema';
import { Withdrawn } from '../generated/Vault/Vault';

export function handleWithdrawn(event: Withdrawn): void {
  const id = event.transaction.hash.concatI32(event.logIndex.toI32());
  const entity = new Withdrawal(id);

  entity.amount = event.params.amount;
  entity.user = event.params.user;
  entity.epoch = event.params.epoch.toI32();

  entity.blockNumber = event.block.number.toI32();
  entity.transactionHash = event.transaction.hash;
  entity.timestamp = event.block.timestamp.toI32();

  entity.save();
}
