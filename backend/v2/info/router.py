"""
System information and health monitoring endpoints.

This module provides endpoints for retrieving system information, monitoring health,
and checking synchronization status of various components.

Key Concepts:
    - System Components:
        - Blockchain: The underlying blockchain network
        - Database: The application's database
        - Subgraph: The Graph Protocol indexer
        - Smart Contracts: Deployed contract addresses
        - Snapshots: Epoch state snapshots

    - Health States:
        - UP: Component is healthy and responsive
        - DOWN: Component is not responding or has errors

    - Snapshot States:
        - Pending Snapshot (made right at the start of Allocation Window):
            - not_applicable: No pending snapshot needed
            - error: Error in snapshot processing
            - in_progress: Snapshot being created
            - done: Snapshot completed
        - Finalized Snapshot (made at the end of Allocation Window):
            - not_applicable: No finalized snapshot needed
            - error: Error in snapshot processing
            - too_early: Too early to finalize
            - in_progress: Snapshot being finalized
            - done: Snapshot finalized

    - Synchronization
        - Blockchain Height: Current block number
        - Indexed Height: Last indexed block
        - Blockchain Epoch: Current epoch number
        - Indexed Epoch: Last indexed epoch
        - Snapshot Status: State of pending/finalized snapshots
"""

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

STATIC_DIR = f"{os.path.dirname(__file__)}/static"
api = APIRouter(prefix="/info", tags=["Info"])


@api.get("/websockets-api")
async def get_websockets_api_v1() -> FileResponse:
    """
    Returns the WebSocket API documentation.

    This endpoint serves the HTML documentation for the WebSocket API,
    providing details about available WebSocket endpoints, message formats,
    and connection requirements.

    Returns:
        FileResponse: HTML documentation for WebSocket API
    """
    return FileResponse(
        f"{STATIC_DIR}/websockets-api-docs.html",
        media_type="text/html",
    )


@api.get("/websockets-api.yaml")
async def get_websockets_api_yaml_v1():
    """
    Returns the WebSocket API specification in YAML format.

    This endpoint serves the OpenAPI/Swagger specification for the WebSocket API
    in YAML format, which can be used to generate client code or documentation.

    Returns:
        FileResponse: YAML specification for WebSocket API
    """
    return FileResponse(
        f"{STATIC_DIR}/websockets-api.yaml",
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
    Returns information about the blockchain and deployed smart contracts.

    This endpoint provides details about the current blockchain network and
    the addresses of all deployed smart contracts used by the application.

    Returns:
        ChainInfoResponseV1 containing:
            - chain_name: Name of the blockchain network
            - chain_id: Network identifier
            - smart_contracts: List of deployed contracts:
                - Auth: Authentication contract
                - Deposits: Deposit management contract
                - Epochs: Epoch management contract
                - GLM: Token contract
                - Projects: Project management contract
                - Vault: Reward vault contract
                - WithdrawalsTarget: Withdrawal target contract
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

    This endpoint provides details about the current deployment of the application,
    including the deployment identifier, environment, and blockchain network.

    Returns:
        VersionResponseV1 containing:
            - id: Unique deployment identifier
            - env: Deployment environment (e.g., production, staging)
            - chain: Name of the blockchain network
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
    Returns the health status of system components.

    This endpoint checks the health of all critical system components:
    1. Blockchain RPC connection
    2. Database connection
    3. Subgraph indexer

    Returns:
        HealthcheckResponseV1 containing:
            - blockchain: 'UP' if RPC is responsive, 'DOWN' otherwise
            - db: 'UP' if database is responsive, 'DOWN' otherwise
            - subgraph: 'UP' if indexer is responsive, 'DOWN' otherwise

    Status Codes:
        - 200: All components are healthy
        - 500: One or more components are down

    Note:
        - Checks chain ID matches expected value
        - Verifies database connection with test query
        - Confirms subgraph is indexing blocks
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
    Returns detailed synchronization status of system components.

    This endpoint provides comprehensive information about the synchronization
    state of all system components, including blockchain, indexer, and snapshots.

    Returns:
        SyncStatusResponseV1 containing:
            - blockchain_epoch: Current epoch from blockchain
            - indexed_epoch: Last indexed epoch
            - blockchain_height: Current block number
            - indexed_height: Last indexed block
            - pending_snapshot: Status of pending snapshot
            - finalized_snapshot: Status of finalized snapshot

    Status Codes:
        - 200: All components are healthy and syncing
        - 500: One or more components are down or not syncing

    Note:
        - Checks blockchain health and current state
        - Verifies subgraph indexing progress
        - Monitors snapshot creation and finalization
        - Reports decision window status
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
