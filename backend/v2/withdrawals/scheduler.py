import logging
from v2.core.dependencies import (
    get_sessionmaker,
    get_database_settings,
    get_w3,
    get_web3_provider_settings,
)
from v2.withdrawals.dependencies import get_vault_contracts, get_vault_settings
from v2.withdrawals.services import confirm_withdrawals


async def confirm_withdrawals_scheduled():
    """
    Confirm withdrawals for the current epoch.
    This is a scheduled task that runs every 15 seconds.
    """

    # Dependencies
    db_settings = get_database_settings()
    sessionmaker = get_sessionmaker(db_settings)
    w3 = get_w3(get_web3_provider_settings())
    vault_settings = get_vault_settings()
    vault = get_vault_contracts(w3, vault_settings)

    async with sessionmaker() as session:
        try:
            await confirm_withdrawals(session, vault)
        except Exception as e:
            logging.error(f"Error while confirming withdrawals: {e}")
