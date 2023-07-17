from flask import current_app as app

from app import database
from app.contracts.vault import vault
from app.crypto.account import Account
from app.settings import config


def confirm_withdrawals():
    snapshot = database.finalized_epoch_snapshot.get_last_snapshot()
    root = vault.get_merkle_root(snapshot.epoch)

    if snapshot.withdrawals_merkle_root is not None and root == bytes(32):
        app.logger.debug(f"Funding vault for epoch: {snapshot.epoch}")
        _fund_vault(snapshot.total_withdrawals)

        app.logger.debug(f"Setting merkle root for epoch: {snapshot.epoch}")
        _set_merkle_root(snapshot.epoch, snapshot.withdrawals_merkle_root)


def _set_merkle_root(epoch: int, merkle_root: str):
    try:
        tx_hash = vault.set_merkle_root(epoch, merkle_root)
        app.logger.info(
            f"Merkle root: {merkle_root} set for epoch: {epoch}, tx: {tx_hash.hex()}"
        )
    except Exception as e:
        if "nonce too low" in str(e).lower():
            pass
        app.logger.error(f"Cannot set merkle root: {e}")


def _fund_vault(value: int):
    try:
        multisig = Account.from_key(config.TESTNET_MULTISIG_PRIVATE_KEY)
        tx_hash = multisig.send_eth(
            config.VAULT_CONTRACT_ADDRESS, int(value), nonce=multisig.nonce + 1
        )
        app.logger.info(
            f"{value} WEI sent to: {config.VAULT_CONTRACT_ADDRESS}, tx: {tx_hash.hex()}"
        )
    except Exception as e:
        if "nonce too low" in str(e).lower():
            pass
        app.logger.error(f"Cannot fund the Vault: {e}")
