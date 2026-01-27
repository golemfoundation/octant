import asyncio
import json
from typing import List

import socketio
from fastapi import FastAPI
from tests.api_e2e.conftest import FastUserAccount


class SocketIOTestResults:
    def __init__(self):
        self.threshold = None
        self.project_rewards = None
        self.project_donors = {}
        self.exception = None
        self.connected = False
        self.received_events = []  # Track all received events
        self.connection_errors = []  # Track connection errors


class SocketIOClient:
    def __init__(
        self, results: SocketIOTestResults, fastapi_app: FastAPI, port: int = 8766
    ):
        self.results = results
        self.fastapi_app = fastapi_app
        self.port = port
        self.sio = socketio.AsyncClient(logger=False, engineio_logger=False)

        # Event Handlers
        self.sio.event(self.connect)
        self.sio.event(self.connect_error)
        self.sio.event(self.disconnect)
        self.sio.on("threshold")(self.on_threshold)
        self.sio.on("project_rewards")(self.on_project_rewards)
        self.sio.on("project_donors")(self.on_project_donors)
        self.sio.on("exception")(self.on_exception)
        self.sio.on("*")(self.catch_all)

    async def connect(self):
        print("SocketIO client connected successfully")
        self.results.connected = True
        self.results.received_events.append("connect")

    async def connect_error(self, data):
        print(f"SocketIO connection error: {data}")
        self.results.connection_errors.append(data)
        self.results.received_events.append(f"connect_error: {data}")

    async def disconnect(self):
        print("SocketIO client disconnected")
        self.results.connected = False
        self.results.received_events.append("disconnect")

    async def on_threshold(self, data):
        print(f"Received threshold event: {data}")
        self.results.threshold = data
        self.results.received_events.append(f"threshold: {data}")

    async def on_project_rewards(self, data):
        print("Received project_rewards event")
        self.results.project_rewards = data
        self.results.received_events.append(f"project_rewards: {data}")

    async def on_project_donors(self, data):
        project = data.get("project")
        donors = data.get("donors")
        print(f"Received project_donors event for project: {project}")
        self.results.project_donors[project] = donors
        self.results.received_events.append(f"project_donors: {project}")

    async def on_exception(self, data):
        print(f"Received exception event: {data}")
        self.results.exception = data
        self.results.received_events.append(f"exception: {data}")

    async def catch_all(self, event, data):
        print(f"Received unhandled event: {event}, data: {data}")
        self.results.received_events.append(f"other: {event}")

    async def connect_to_server(self):
        await self.sio.connect(f"http://127.0.0.1:{self.port}")

    async def emit_allocation(
        self,
        alice_proposals: List[str],
        allocation_amount: int,
        ua_alice_nonce: int,
        ua_alice: FastUserAccount,
        signature: str,
    ):
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
        print(f"Emitting allocate event with payload: {allocation_payload}")
        await self.sio.emit("allocate", json.dumps(allocation_payload))
        print("Allocate event emitted")

    async def wait_for_events(self, timeout: int, alice_proposals: List[str]):
        loop = asyncio.get_running_loop()
        start_time = loop.time()
        last_log_time = start_time

        while (
            self.results.threshold is None
            or self.results.project_rewards is None
            or len(self.results.project_donors) < len(alice_proposals)
        ) and loop.time() - start_time < timeout:
            current_time = loop.time()
            if current_time - last_log_time >= 1.0:
                print(
                    f"Waiting for events... Time elapsed: {current_time - start_time:.1f}s"
                )
                print(f"  Threshold received: {self.results.threshold is not None}")
                print(
                    f"  Project rewards received: {self.results.project_rewards is not None}"
                )
                print(
                    f"  Project donors received: {len(self.results.project_donors)}/{len(alice_proposals)}"
                )
                last_log_time = current_time

            await asyncio.sleep(0.1)

        elapsed = loop.time() - start_time
        print(f"Done waiting after {elapsed:.1f} seconds")
