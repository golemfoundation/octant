from flask import current_app as app

from app.infrastructure import database
from app.legacy.crypto.account import Account
from app.extensions import vault


def confirm_withdrawals():
    snapshot = database.finalized_epoch_snapshot.get_last_snapshot()
    root = vault.get_merkle_root(snapshot.epoch)

    if snapshot.withdrawals_merkle_root is not None and root == bytes(32):
        app.logger.debug(f"Funding vault for epoch: {snapshot.epoch}")
        multisig = Account.from_key(app.config["TESTNET_MULTISIG_PRIVATE_KEY"])
        _fund_vault(multisig, snapshot.total_withdrawals)

        app.logger.debug(f"Setting merkle root for epoch: {snapshot.epoch}")
        _set_merkle_root(multisig, snapshot.epoch, snapshot.withdrawals_merkle_root)


def _set_merkle_root(account: Account, epoch: int, merkle_root: str):
    try:
        tx_hash = vault.set_merkle_root(account, epoch, merkle_root)
        app.logger.debug(
            f"Merkle root: {merkle_root} set for epoch: {epoch}, tx: {tx_hash.hex()}"
        )
    except Exception as e:
        if "nonce too low" in str(e).lower():
            pass
        app.logger.error(f"Cannot set merkle root: {e}")


def _fund_vault(account: Account, value: str):
    try:
        tx_hash = account.send_eth(
            app.config["VAULT_CONTRACT_ADDRESS"], int(value), nonce=account.nonce + 1
        )
        app.logger.debug(
            f"{value} WEI sent to: {app.config['VAULT_CONTRACT_ADDRESS']}, tx: {tx_hash.hex()}"
        )
    except Exception as e:
        if "nonce too low" in str(e).lower():
            pass
        app.logger.error(f"Cannot fund the Vault: {e}")
