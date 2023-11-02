import { Withdrawal, VaultMerkleRoot } from '../generated/schema';
import { Withdrawn, MerkleRootSet } from '../generated/Vault/Vault';

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

export function handleMerkleRootSet(event: MerkleRootSet): void {
  const id = event.transaction.hash.concatI32(event.logIndex.toI32());
  const entity = new VaultMerkleRoot(id);

  entity.epoch = event.params.epoch.toI32();
  entity.root = event.params.root;

  entity.blockNumber = event.block.number.toI32();
  entity.transactionHash = event.transaction.hash;
  entity.timestamp = event.block.timestamp.toI32();

  entity.save();
}
