import logging
import os
from eth_account import Account
from sqlalchemy.ext.asyncio import AsyncSession

from v2.epoch_snapshots.repositories import get_last_finalized_epoch_snapshot
from v2.withdrawals.contracts import VaultContracts


async def confirm_withdrawals(session: AsyncSession, vault: VaultContracts):
    snapshot = await get_last_finalized_epoch_snapshot(session)
    root = await vault.get_merkle_root(snapshot.epoch)

    if snapshot.withdrawals_merkle_root is not None and root == bytes(32):
        logging.debug("Building multisig account")
        multisig = Account.from_key(os.getenv("TESTNET_MULTISIG_PRIVATE_KEY"))

        logging.debug(f"Funding vault for epoch: {snapshot.epoch}")
        try:
            vault_address = os.getenv("VAULT_CONTRACT_ADDRESS")

            nonce = await vault.w3.eth.get_transaction_count(
                multisig.address, block_identifier="latest"
            )
            chain_id = int(os.getenv("CHAIN_ID"))
            transaction = {
                "chainId": chain_id,
                "from": multisig.address,
                "to": vault_address,
                "value": int(snapshot.total_withdrawals),
                "gasPrice": await vault.w3.eth.gas_price,
                "nonce": nonce + 1,
            }

            transaction["gas"] = await vault.w3.eth.estimate_gas(transaction)
            signed_tx = multisig.sign_transaction(transaction)
            tx_hash = await vault.w3.eth.send_raw_transaction(signed_tx.rawTransaction)

            logging.debug(
                f"{snapshot.total_withdrawals} WEI sent to: {vault_address}, tx: {tx_hash.hex()}"
            )
        except Exception as e:
            if "nonce too low" in str(e).lower():
                pass
            logging.error(f"Cannot fund the Vault: {e}")

        logging.debug(f"Setting merkle root for epoch: {snapshot.epoch}")
        try:
            tx_hash = await vault.set_merkle_root(
                multisig, snapshot.epoch, snapshot.withdrawals_merkle_root
            )
            logging.debug(
                f"Merkle root: {snapshot.withdrawals_merkle_root} set for epoch: {snapshot.epoch}, tx: {tx_hash.hex()}"
            )
        except Exception as e:
            if "nonce too low" in str(e).lower():
                pass
            logging.error(f"Cannot set merkle root: {e}")
