import logging
import os

from fastapi import APIRouter, Response, status
from fastapi.responses import FileResponse
from v2.core.dependencies import (
    GetChainSettings,
    GetEnvironmentSettings,
    GetSessionmaker,
    Web3,
)
from v2.deposits.dependencies import GetDepositsSettings
from v2.epochs.dependencies import (
    GetEpochsContracts,
    GetEpochSettings,
    GetEpochsSubgraph,
)
from v2.glms.dependencies import GetGLMSettings
from v2.info.dependencies import GetAuthSettings
from v2.info.schemas import (
    ChainInfoResponseV1,
    HealthcheckResponseV1,
    SmartContractResponseV1,
    SyncStatusResponseV1,
    VersionResponseV1,
)
from v2.info.services import (
    check_blockchain,
    check_database,
    check_subgraph,
    get_finalized_snapshot_status,
    get_pending_snapshot_status,
)
from v2.projects.dependencies import GetProjectsSettings
from v2.withdrawals.dependencies import GetVaultSettings

static_dir = f"{os.path.dirname(__file__)}/static"
api = APIRouter(prefix="/info", tags=["Info"])


@api.get("/websockets-api")
async def get_websockets_api_v1() -> FileResponse:
    """
    The documentation for websockets can be found under this path
    """
    return FileResponse(
        f"{static_dir}/websockets-api-docs.html",
        media_type="text/html",
    )


@api.get("/websockets-api.yaml")
async def get_websockets_api_yaml_v1():
    """
    Returns websockets API documentation.
    """
    return FileResponse(
        f"{static_dir}/websockets-api.yaml",
        media_type="text/plain",
    )


@api.get("/chain-info")
async def get_chain_info_v1(
    chain: GetChainSettings,
    auth: GetAuthSettings,
    epochs: GetEpochSettings,
    deposits: GetDepositsSettings,
    glm: GetGLMSettings,
    projects: GetProjectsSettings,
    vault: GetVaultSettings,
) -> ChainInfoResponseV1:
    """
    Returns chain info.
    """

    contracts = {
        "Auth": auth.auth_contract_address,
        "Deposits": deposits.deposits_contract_address,
        "Epochs": epochs.epochs_contract_address,
        "GLM": glm.glm_contract_address,
        "Projects": projects.projects_contract_address,
        "Vault": vault.vault_contract_address,
        "WithdrawalsTarget": vault.withdrawals_target_contract_address,
    }

    return ChainInfoResponseV1(
        chain_name=chain.chain_name,
        chain_id=chain.chain_id,
        smart_contracts=[
            SmartContractResponseV1(name=name, address=address)
            for name, address in contracts.items()
        ],
    )


@api.get("/version")
async def get_version_v1(
    chain: GetChainSettings,
    environment: GetEnvironmentSettings,
) -> VersionResponseV1:
    """
    Returns application deployment information.
    """

    return VersionResponseV1(
        id=environment.deployment_id,
        env=environment.env,
        chain=chain.chain_name,
    )


@api.get("/healthcheck")
async def get_healthcheck_v1(
    chain_settings: GetChainSettings,
    w3: Web3,
    sessionmaker: GetSessionmaker,
    epochs_subgraph: GetEpochsSubgraph,
    response: Response,
) -> HealthcheckResponseV1:
    """
    Returns application healthcheck.

    Returns 200 OK if all services are up.
    Returns 500 if some services are down.
    """

    # Run all health checks
    is_blockchain_healthy = await check_blockchain(w3, chain_settings.chain_id)
    is_db_healthy = await check_database(sessionmaker)
    is_subgraph_healthy = await check_subgraph(epochs_subgraph)

    # If any of the services are down, return 500 status code
    if not all([is_blockchain_healthy, is_db_healthy, is_subgraph_healthy]):
        logging.warning(
            f"[Healthcheck] failed: chain_rpc: {is_blockchain_healthy}, db_health: {is_db_healthy}, subgraph_health: {is_subgraph_healthy}"
        )
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    return HealthcheckResponseV1(
        blockchain="UP" if is_blockchain_healthy else "DOWN",
        db="UP" if is_db_healthy else "DOWN",
        subgraph="UP" if is_subgraph_healthy else "DOWN",
    )


@api.get("/sync-status")
async def get_sync_status_v1(
    chain_settings: GetChainSettings,
    w3: Web3,
    sessionmaker: GetSessionmaker,
    epochs_subgraph: GetEpochsSubgraph,
    epochs_contracts: GetEpochsContracts,
    response: Response,
) -> SyncStatusResponseV1:
    """
    Returns synchronization status for indexer and database.

    Returns 200 OK if all services are up and syncing.
    Returns 500 if some services are down, sync status unknown.
    """

    # Run all health checks
    is_blockchain_healthy = await check_blockchain(w3, chain_settings.chain_id)
    is_db_healthy = await check_database(sessionmaker)
    is_subgraph_healthy = await check_subgraph(epochs_subgraph)

    # Checking blockchain health
    if is_blockchain_healthy:
        last_block = await w3.eth.get_block("latest")
        blockchain_height = last_block["number"]
        blockchain_epoch_number = await epochs_contracts.get_current_epoch()
        is_decision_window_open = await epochs_contracts.is_decision_window_open()
    else:
        blockchain_height = None
        blockchain_epoch_number = None
        is_decision_window_open = False

    # Checking subgraph health
    if is_subgraph_healthy:
        (
            indexed_epoch,
            indexed_height,
        ) = await epochs_subgraph.get_last_indexed_epoch_and_height()
    else:
        indexed_epoch = None
        indexed_height = None

    # Checking database health
    if is_db_healthy and blockchain_epoch_number is not None:
        async with sessionmaker() as session:
            pending_snapshot = await get_pending_snapshot_status(
                session, blockchain_epoch_number
            )
            finalized_snapshot = await get_finalized_snapshot_status(
                session, blockchain_epoch_number, is_decision_window_open
            )
    else:
        pending_snapshot = None
        finalized_snapshot = None

    if not all([is_blockchain_healthy, is_db_healthy, is_subgraph_healthy]):
        logging.warning(
            f"[SyncStatus] failed: chain_rpc: {is_blockchain_healthy}, db_health: {is_db_healthy}, subgraph_health: {is_subgraph_healthy}"
        )
        response.status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    return SyncStatusResponseV1(
        blockchain_epoch=blockchain_epoch_number,
        indexed_epoch=indexed_epoch,
        blockchain_height=blockchain_height,
        indexed_height=indexed_height,
        pending_snapshot=pending_snapshot,
        finalized_snapshot=finalized_snapshot,
    )
