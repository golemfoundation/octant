from dataclasses import dataclass
from typing import List

from dataclass_wizard import JSONWizard

from app.settings import config


@dataclass(frozen=True)
class SmartContract(JSONWizard):
    name: str
    address: str


@dataclass(frozen=True)
class ChainInfo(JSONWizard):
    chain_name: str
    chain_id: str
    smart_contracts: List[SmartContract]


def get_blockchain_info() -> ChainInfo:
    smart_contracts = [
        SmartContract("GLM", config.GLM_CONTRACT_ADDRESS),
        SmartContract("GNT", config.GNT_CONTRACT_ADDRESS),
        SmartContract("Epochs", config.EPOCHS_CONTRACT_ADDRESS),
        SmartContract("Auth", config.AUTH_CONTRACT_ADDRESS),
        SmartContract("Deposits", config.DEPOSITS_CONTRACT_ADDRESS),
        SmartContract("Proposals", config.PROPOSALS_CONTRACT_ADDRESS),
        SmartContract("WithdrawalsTarget", config.WITHDRAWALS_TARGET_CONTRACT_ADDRESS),
        SmartContract("Vault", config.VAULT_CONTRACT_ADDRESS)
    ]

    return ChainInfo(
        chain_name=config.CHAIN_NAME,
        chain_id=config.CHAIN_ID,
        smart_contracts=smart_contracts
    )
