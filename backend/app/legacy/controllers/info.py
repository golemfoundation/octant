from dataclasses import dataclass
from typing import List, Tuple

from app.extensions import w3, epochs
from app.infrastructure import database, graphql
from app.infrastructure.exception_handler import ExceptionHandler
from app.legacy.controllers import snapshots
from dataclass_wizard import JSONWizard
from flask import current_app as app


@dataclass(frozen=True)
class SmartContract(JSONWizard):
    name: str
    address: str


@dataclass(frozen=True)
class ChainInfo(JSONWizard):
    chain_name: str
    chain_id: str
    smart_contracts: List[SmartContract]


@dataclass(frozen=True)
class Healthcheck(JSONWizard):
    blockchain: str
    db: str
    subgraph: str


@dataclass(frozen=True)
class SyncStatus(JSONWizard):
    blockchainEpoch: int | None
    indexedEpoch: int | None
    blockchainHeight: int | None
    indexedHeight: int | None
    pendingSnapshot: str | None
    finalizedSnapshot: str | None


def get_blockchain_info() -> ChainInfo:
    smart_contracts = [
        SmartContract("Auth", app.config["AUTH_CONTRACT_ADDRESS"]),
        SmartContract("Deposits", app.config["DEPOSITS_CONTRACT_ADDRESS"]),
        SmartContract("Epochs", app.config["EPOCHS_CONTRACT_ADDRESS"]),
        SmartContract("GLM", app.config["GLM_CONTRACT_ADDRESS"]),
        SmartContract("Projects", app.config["PROJECTS_CONTRACT_ADDRESS"]),
        SmartContract("Vault", app.config["VAULT_CONTRACT_ADDRESS"]),
        SmartContract(
            "WithdrawalsTarget", app.config["WITHDRAWALS_TARGET_CONTRACT_ADDRESS"]
        ),
    ]
    return ChainInfo(
        chain_name=app.config["CHAIN_NAME"],
        chain_id=app.config["CHAIN_ID"],
        smart_contracts=smart_contracts,
    )


def healthcheck() -> Tuple[Healthcheck, int]:
    try:
        is_chain_rpc_healthy = w3.eth.chain_id == app.config["CHAIN_ID"]
    except Exception as e:
        app.logger.warning(f"[Healthcheck] blockchain is down with an error: {e}")
        ExceptionHandler.print_stacktrace(e)
        is_chain_rpc_healthy = False

    try:
        is_db_healthy = database.info.is_db_responsive()
    except Exception as e:
        app.logger.warning(f"[Healthcheck] db is down with an error: {e}")
        ExceptionHandler.print_stacktrace(e)
        is_db_healthy = False

    try:
        is_subgraph_healthy = graphql.info.get_indexed_block_num() > 0
    except Exception as e:
        app.logger.warning(f"[Healthcheck] subgraph is down with an error: {e}")
        ExceptionHandler.print_stacktrace(e)
        is_subgraph_healthy = False

    healthcheck_status = Healthcheck(
        blockchain="UP" if is_chain_rpc_healthy else "DOWN",
        db="UP" if is_db_healthy else "DOWN",
        subgraph="UP" if is_subgraph_healthy else "DOWN",
    )

    if False in (is_chain_rpc_healthy, is_db_healthy, is_subgraph_healthy):
        app.logger.warning(
            f"[Healthcheck] failed: chain_rpc: {is_chain_rpc_healthy}, db_health: {is_db_healthy}, subgraph_health: {is_subgraph_healthy}"
        )
        return healthcheck_status, 500

    return healthcheck_status, 200


def sync_status() -> Tuple[SyncStatus, int]:
    services, status = healthcheck()
    blockchainEpoch = None
    indexedEpoch = None
    blockchainHeight = None
    indexedHeight = None
    pendingSnapshot = None
    finalizedSnapshot = None
    if services.blockchain == "UP":
        blockchainHeight = w3.eth.get_block("latest")["number"]
        blockchainEpoch = epochs.get_current_epoch()
    if services.subgraph == "UP":
        sg_result = graphql.epochs.get_epochs()
        sg_epochs = sorted(sg_result["epoches"], key=lambda d: d["epoch"])
        indexedEpoch = sg_epochs[-1:][0]["epoch"] if sg_epochs else 0
        indexedHeight = sg_result["_meta"]["block"]["number"]

    if status == 200:
        finalizedSnapshot = snapshots.get_finalized_snapshot_status()
        pendingSnapshot = snapshots.get_pending_snapshot_status()

    return (
        SyncStatus(
            blockchainEpoch=blockchainEpoch,
            indexedEpoch=indexedEpoch,
            blockchainHeight=blockchainHeight,
            indexedHeight=indexedHeight,
            pendingSnapshot=pendingSnapshot,
            finalizedSnapshot=finalizedSnapshot,
        ),
        status,
    )
