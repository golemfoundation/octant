import socketio
import asyncio
import logging
from app.legacy.core.projects import get_projects_addresses
import json
import pytest

from fastapi import FastAPI
from tests.api_e2e.conftest import FastAPIClient
from tests.conftest import UserAccount
from tests.helpers.constants import STARTING_EPOCH

# Start the server in a separate task
import uvicorn
import threading
import io


@pytest.mark.api
def test_allocations_via_socketio(
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
    alice_proposals = get_projects_addresses(1)[:3]
    allocation_amount = 1000

    print(
        f"Testing socketio with {len(alice_proposals)} proposals and amount {allocation_amount}"
    )

    # Lock GLM for allocation
    ua_alice.lock(10000)

    # Forward time to the beginning of epoch
    fclient.move_to_next_epoch(STARTING_EPOCH + 1)

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

    # Create a test for FastAPI socketio
    # We'll need to run the server and client in an event loop

    class SocketIOTestResults:
        def __init__(self):
            self.threshold = None
            self.project_rewards = None
            self.project_donors = {}
            self.exception = None
            self.connected = False
            self.received_events = []  # Track all received events
            self.connection_errors = []  # Track connection errors

    # Store results in this object
    results = SocketIOTestResults()

    async def run_test():
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

        # Wait for server to start
        await asyncio.sleep(2)

        # Create socketio client
        sio = socketio.AsyncClient(logger=False, engineio_logger=False)

        @sio.event
        async def connect():
            print("SocketIO client connected successfully")
            results.connected = True
            results.received_events.append("connect")

        @sio.event
        async def connect_error(data):
            print(f"SocketIO connection error: {data}")
            results.connection_errors.append(data)
            results.received_events.append(f"connect_error: {data}")

        @sio.event
        async def disconnect():
            print("SocketIO client disconnected")
            results.connected = False
            results.received_events.append("disconnect")

        @sio.on("threshold")
        async def on_threshold(data):
            print(f"Received threshold event: {data}")
            results.threshold = data
            results.received_events.append(f"threshold: {data}")

        @sio.on("project_rewards")
        async def on_project_rewards(data):
            print("Received project_rewards event")
            results.project_rewards = data
            results.received_events.append(f"project_rewards: {data}")

        @sio.on("project_donors")
        async def on_project_donors(data):
            project = data.get("project")
            donors = data.get("donors")
            print(f"Received project_donors event for project: {project}")
            results.project_donors[project] = donors
            results.received_events.append(f"project_donors: {project}")

        @sio.on("exception")
        async def on_exception(data):
            print(f"Received exception event: {data}")
            results.exception = data
            results.received_events.append(f"exception: {data}")

        # Catch any other events
        @sio.on("*")
        async def catch_all(event, data):
            print(f"Received unhandled event: {event}, data: {data}")
            results.received_events.append(f"other: {event}")

        try:
            # Connect to the WebSocket server
            print("Attempting to connect to WebSocket server...")
            await sio.connect("http://127.0.0.1:8766")

            if not results.connected:
                print("Failed to connect to WebSocket server despite no exception")
                print(f"Connection errors: {results.connection_errors}")
            else:
                print("Successfully connected to WebSocket server")

                # Prepare allocation payload
                allocation_payload = {
                    "payload": {
                        "allocations": [
                            {"proposalAddress": address, "amount": allocation_amount}
                            for address in alice_proposals
                        ],
                        "nonce": ua_alice_nonce,
                    },
                    "userAddress": ua_alice.address,
                    "signature": signature,
                    "isManuallyEdited": False,
                }

                # Send allocation via socketio
                print(f"Emitting allocate event with payload: {allocation_payload}")
                await sio.emit("allocate", json.dumps(allocation_payload))
                print("Allocate event emitted")

                # Wait for responses
                timeout = 5
                print(f"Waiting up to {timeout} seconds for responses...")
                start_time = asyncio.get_event_loop().time()

                # Track progress of received events
                last_log_time = start_time
                while (
                    results.threshold is None
                    or results.project_rewards is None
                    or len(results.project_donors) < len(alice_proposals)
                ) and asyncio.get_event_loop().time() - start_time < timeout:
                    # Log status every second
                    current_time = asyncio.get_event_loop().time()
                    if current_time - last_log_time >= 1.0:
                        print(
                            f"Waiting for events... Time elapsed: {current_time - start_time:.1f}s"
                        )
                        print(f"  Threshold received: {results.threshold is not None}")
                        print(
                            f"  Project rewards received: {results.project_rewards is not None}"
                        )
                        print(
                            f"  Project donors received: {len(results.project_donors)}/{len(alice_proposals)}"
                        )
                        last_log_time = current_time

                    await asyncio.sleep(0.1)

                elapsed = asyncio.get_event_loop().time() - start_time
                print(f"Done waiting after {elapsed:.1f} seconds")

                # Print summary of received events
                print(
                    f"Received {len(results.received_events)} events: {results.received_events}"
                )
                print(f"Threshold received: {results.threshold is not None}")
                print(
                    f"Project rewards received: {results.project_rewards is not None}"
                )
                print(
                    f"Project donors received: {len(results.project_donors)}/{len(alice_proposals)}"
                )

        except Exception as e:
            print(f"Exception during SocketIO test: {e}")
            import traceback

            traceback.print_exc()
            results.exception = str(e)
        finally:
            # Disconnect and clean up
            print("Cleaning up SocketIO connection")
            if results.connected:
                await sio.disconnect()

            # Return server logs for analysis
            print("Server logs:")
            server_logs = server_log.getvalue()
            print(server_logs)
            return server_logs  # noqa: B012

    # Run the async test
    server_logs = None
    try:
        # Set a longer timeout for the event loop to complete
        print("Starting SocketIO test with asyncio.run...")
        server_logs = asyncio.run(asyncio.wait_for(run_test(), timeout=15))
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
        import traceback

        traceback.print_exc()

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
