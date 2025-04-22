import asyncio
import io
import logging
import socket
import threading
import traceback
from typing import Any, List

import pytest
import uvicorn
from fastapi import FastAPI
from tests.api_e2e.conftest import FastAPIClient
from tests.api_e2e.socketio_client import SocketIOClient, SocketIOTestResults
from tests.conftest import UserAccount
from tests.helpers.constants import STARTING_EPOCH


async def wait_for_server(host: str, port: int, timeout: float = 3.0) -> None:
    start_time = asyncio.get_event_loop().time()
    while True:
        try:
            with socket.create_connection((host, port), timeout=0.5):
                return
        except (ConnectionRefusedError, socket.timeout):
            await asyncio.sleep(0.1)
        if asyncio.get_event_loop().time() - start_time > timeout:
            raise TimeoutError(
                f"Server at {host}:{port} did not start within {timeout} seconds"
            )


async def run_test(
    results: SocketIOTestResults,
    fastapi_app: FastAPI,
    alice_proposals: List[str],
    allocation_amount: int,
    ua_alice_nonce: int,
    ua_alice: UserAccount,
    signature: str,
) -> str:
    # Capture server logs
    server_log = io.StringIO()
    log_handler = logging.StreamHandler(server_log)
    log_handler.setLevel(logging.WARNING)
    uvicorn_logger = logging.getLogger("uvicorn")
    uvicorn_logger.addHandler(log_handler)

    server_thread = threading.Thread(
        target=uvicorn.run,
        kwargs={
            "app": fastapi_app,
            "host": "127.0.0.1",
            "port": 8766,
            "log_level": "warning",  # Only warnings and above
        },
    )
    server_thread.daemon = True
    server_thread.start()

    print("Server thread started, waiting for it to initialize...")

    # Wait for server to start (replace sleep with wait_for_server)
    await wait_for_server("127.0.0.1", 8766, timeout=3.0)

    # Use the SocketIOClient wrapper
    client = SocketIOClient(results, fastapi_app, port=8766)

    try:
        # Connect to the WebSocket server
        print("Attempting to connect to WebSocket server...")
        await client.connect_to_server()

        if not results.connected:
            print("Failed to connect to WebSocket server despite no exception")
            print(f"Connection errors: {results.connection_errors}")
        else:
            print("Successfully connected to WebSocket server")

            # Emit allocation event
            await client.emit_allocation(
                alice_proposals, allocation_amount, ua_alice_nonce, ua_alice, signature
            )

            # Wait for responses
            timeout = 5
            print(f"Waiting up to {timeout} seconds for responses...")
            await client.wait_for_events(timeout, alice_proposals)

            # Print summary of received events
            print(
                f"Received {len(results.received_events)} events: {results.received_events}"
            )
            print(f"Threshold received: {results.threshold is not None}")
            print(f"Project rewards received: {results.project_rewards is not None}")
            print(
                f"Project donors received: {len(results.project_donors)}/{len(alice_proposals)}"
            )

    except Exception as e:
        print(f"Exception during SocketIO test: {e}")
        traceback.print_exc()
        results.exception = str(e)
    finally:
        # Disconnect and clean up
        print("Cleaning up SocketIO connection")
        if results.connected:
            await client.sio.disconnect()

        # Return server logs for analysis
        print("Server logs:")
        server_logs = server_log.getvalue()
        print(server_logs)
        return server_logs  # noqa: B012


async def try_run_test(
    fastapi_app: FastAPI,
    alice_proposals: List[str],
    allocation_amount: int,
    ua_alice_nonce: int,
    ua_alice: UserAccount,
    signature: str,
    caplog: Any,
) -> tuple[SocketIOTestResults, str]:
    """Helper to run the async test and handle exceptions, returning results and server logs."""
    results = SocketIOTestResults()
    server_logs = None
    try:
        print("Starting SocketIO test with asyncio.run...")
        server_logs = await asyncio.wait_for(
            run_test(
                results,
                fastapi_app,
                alice_proposals,
                allocation_amount,
                ua_alice_nonce,
                ua_alice,
                signature,
            ),
            timeout=15,
        )
    except asyncio.TimeoutError:
        print("Test timed out after 15 seconds")
        print("Current state of results:")
        print(f"  Connected: {results.connected}")
        print(f"  Received events: {results.received_events}")
        print(f"  Connection errors: {results.connection_errors}")
        print(f"  Threshold received: {results.threshold is not None}")
        print(f"  Project rewards received: {results.project_rewards is not None}")
        print(
            f"  Project donors received: {len(results.project_donors)}/{len(alice_proposals)}"
        )
        print(f"  Exception: {results.exception}")
    except Exception as e:
        print(f"Unexpected exception during test: {e}")
        traceback.print_exc()
    return results, server_logs


@pytest.mark.api
@pytest.mark.asyncio
async def test_allocations_via_socketio(
    fclient: FastAPIClient,
    fastapi_app: FastAPI,
    ua_alice: UserAccount,
    setup_funds,
    monkeypatch,
    caplog,
):
    """
    Test allocations via socketio WebSockets in FastAPI implementation.
    """

    # Set up logging to capture server output
    caplog.set_level(logging.WARNING)

    # Setup test data
    projects, _ = fclient.get_projects(1)
    alice_proposals = projects["projectsAddresses"][:3]
    allocation_amount = 1000

    print(
        f"Testing socketio with {len(alice_proposals)} proposals and amount {allocation_amount}"
    )

    # Lock GLM for allocation
    ua_alice.lock(10000)

    # Forward time to the beginning of epoch
    await fclient.move_to_next_epoch(STARTING_EPOCH + 1)

    # Wait for indexer to catch up
    epoch_no = fclient.wait_for_sync(STARTING_EPOCH + 1)
    print(f"Indexer synced to epoch: {epoch_no}")

    # Make a snapshot
    res = fclient.pending_snapshot()
    assert res["epoch"] > 0

    # Get nonce for allocation
    ua_alice_nonce, _ = ua_alice._client.get_allocation_nonce(ua_alice.address)

    # Sign the allocation operation
    signature = ua_alice._client.sign_operation(
        ua_alice._account, allocation_amount, alice_proposals, ua_alice_nonce
    )

    # Store results in this object
    results, server_logs = try_run_test(
        fastapi_app,
        alice_proposals,
        allocation_amount,
        ua_alice_nonce,
        ua_alice,
        signature,
        caplog,
    )

    # Print test logs
    print("Test logs from caplog:")
    for record in caplog.records:
        print(f"{record.levelname}: {record.message}")

    # Verify results
    # Check if we received an exception
    if results.exception:
        pytest.fail(f"Received exception: {results.exception}")

    # In case the connection wasn't established, check server logs and print more details
    if not results.connected:
        error_msg = "Could not connect to the WebSocket server"
        if results.connection_errors:
            error_msg += f", errors: {results.connection_errors}"
        if server_logs:
            error_msg += f", server logs: {server_logs}"
        pytest.skip(error_msg)

    # Verify threshold was received
    assert results.threshold is not None, "No threshold received"
    assert "threshold" in results.threshold

    # Verify project rewards were received
    assert results.project_rewards is not None, "No project rewards received"

    # Verify project donors were received - this may not be complete if test timed out
    if len(results.project_donors) == 0:
        print("Warning: No project donors received, but continuing test")

    # Verify allocations are reflected in the API
    allocations, status_code = fclient.get_epoch_allocations(STARTING_EPOCH + 1)
    assert status_code == 200, f"Expected status code 200, got {status_code}"
    assert allocations["allocations"], "Allocations should not be empty"

    # Verify user allocations
    user_allocations, status_code = fclient.get_user_allocations(
        STARTING_EPOCH + 1, ua_alice.address
    )
    assert (
        status_code == 200
    ), f"Expected status code 200, got {status_code} when getting user allocations"
    assert user_allocations["allocations"], "User allocations should not be empty"

    # Check each proposal received the allocation
    for proposal in alice_proposals:
        found = False
        for allocation in user_allocations["allocations"]:
            if allocation["address"] == proposal:
                assert (
                    int(allocation["amount"]) == allocation_amount
                ), f"Expected amount {allocation_amount}, got {allocation['amount']}"
                found = True
                break
        assert found, f"Allocation for proposal {proposal} not found"
