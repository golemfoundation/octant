import asyncio
import socketio

from app.legacy.crypto.eip712 import sign
from v2.allocations.validators import build_allocations_eip712_data

# Create a Socket.IO client
sio = socketio.AsyncClient(logger=True, engineio_logger=True)


# Define event handlers
@sio.event
async def connect():
    print(">>>Connected to the server")


@sio.event
async def connect_error(data):
    print(">>>The connection failed with error:", data)


@sio.event
async def disconnect():
    print(">>>I'm disconnected!")


# A handler for any event with a wildcard (not all implementations of Socket.IO support this feature directly)
@sio.on("*")
async def catch_all(event, data):
    print(f">>>Received an event of type '{event}' with data:", data)


@sio.event
async def epoch(data):
    print(f">>>Epoch received: {data}")


@sio.event
async def project_rewards(data):
    print(f"Message received: {data}")


@sio.event
async def threshold(data):
    print(f"Custom event received: {data}")


# Connect to the server
async def main():
    print("Connecting to the server...")
    await sio.connect("http://localhost:8000/", wait_timeout=10)
    print("Connected. Waiting for events...")
    # This line will keep the client running and listening for events

    # Emit events

    # Emit a custom event
    data = {
        "userAddress": "0xb429d71F676f6e804010D8B699EefbF1ed050420",
        "payload": {
            "allocations": [
                {
                    "proposalAddress": "0x1c01595f9534E33d411035AE99a4317faeC4f6Fe",
                    "amount": 100,
                },
                {
                    "proposalAddress": "0x6e8873085530406995170Da467010565968C7C62",
                    "amount": 200,
                },
            ],
            "nonce": 0,
            "signature": "0x03c0e67cdc612bf1c0a690346805c5f461fbc0a8fe3041b4849c9ddbc939553a53997dfb6578200192e071618d9f054ae68513f134206149acf70ff04cea02931c",
        },
        "isManuallyEdited": False,
    }
    await sio.emit("allocate", data)

    await sio.wait()


# Emit events
async def emit_event(event_name, data):
    await sio.emit(event_name, data)


# Run the client
# if __name__ == "__main__":
#     asyncio.run(main())


from tests.helpers.constants import ALICE, BOB
from v2.projects.depdendencies import ProjectsSettings, get_projects_contracts
from v2.core.dependencies import Web3ProviderSettings, get_w3
from v2.epochs.dependencies import EpochsSettings, get_epochs_contracts
from v2.deposits.dependencies import DepositsSettings, get_deposits_contracts
from v2.glms.dependencies import GLMSettings, get_glm_contracts

w3 = get_w3(Web3ProviderSettings())
epochs_contracts = get_epochs_contracts(w3, EpochsSettings())
projects_contracts = get_projects_contracts(w3, ProjectsSettings())
deposits_contracts = get_deposits_contracts(w3, DepositsSettings())
glm_contracts = get_glm_contracts(w3, GLMSettings())
# epochs_subgraph = get_epochs_subgraph(EpochsSubgraphSettings())


from eth_account.signers.local import LocalAccount
from eth_account import Account as EthAccount


async def move_to_next_epoch(target: int):

    assert await epochs_contracts.get_current_epoch() == target - 1
    now = (await w3.eth.get_block("latest")).timestamp
    nextEpochAt = await epochs_contracts.get_current_epoch_end()
    forward = nextEpochAt - now + 30
    # await w3.provider.make_request("evm_increaseTime", [forward])
    # await w3.provider.make_request("evm_mine", [])
    # assert await epochs_contracts.get_current_epoch() == target

chain_id = 11155111  # Sepolia

mine = "a184bdfb5f83fcd76d7f6ac4ae530c69fa941845283b23aee8db411e31c8a367"
me: LocalAccount = EthAccount.from_key(mine)

project_addresses = [
    "0x0B7246eF74Ca7b37Fdc3D15be4f0b49876622F95",
    "0x0c9dc7622aE5f56491aB4cCe060d6002450B79D2",
]

async def mine():
    current = await epochs_contracts.get_current_epoch()
    ts =  await epochs_contracts.get_current_epoch_end()
    pending = await epochs_contracts.get_pending_epoch()
    duration = await epochs_contracts.get_epoch_duration()
    finalized = await epochs_contracts.get_finalized_epoch()
    decision_window = await epochs_contracts.get_decision_window()
    is_open = await epochs_contracts.is_decision_window_open()

    print("current: ", current)
    print("ts: ", ts)
    print("pending: ", pending)
    print("duration: ", duration)
    print("finalized: ", finalized)
    print("decision_window: ", decision_window)
    print("is_open: ", is_open)

    return ts


def allocate():

    asyncio.run(mine())

    # rv = self._flask_client.get(f"/allocations/users/{address}/allocation_nonce")
    nonce = 0


    payload = {
        "allocations": [
            {
                "proposalAddress": address,
                "amount": 10,
            }
            for address in project_addresses
        ],
        "nonce": nonce,
    }

    data = build_allocations_eip712_data(chain_id, payload)

    signature = sign(me, data)


    import requests
    import time

    start = time.time()
    resp = requests.post(
        "https://uat-backend.octant.wildland.dev/allocations/allocate",
        json={
            "payload": payload,
            "userAddress": me.address,
            "signature": signature,
        },
    )
    print("time taken: ", time.time() - start)
    
    print("after request")
    print(resp.status_code)
    print(resp.json())

    # rv = self._flask_client.post(
    #     "/allocations/allocate",
    #     json={
    #         "payload": {
    #             "allocations": [
    #                 {"proposalAddress": address, "amount": amount}
    #                 for address in addresses
    #             ],
    #             "nonce": nonce,
    #         },
    #         "userAddress": account.address,
    #         "signature": signature,
    #     },
    # )
    # return rv.status_code

if __name__ == "__main__":
    allocate()

# async def test_allocation():

#     pending = await epochs_contracts.get_pending_epoch()

#     alice_proposals = await projects_contracts.get_project_addresses(1)[:3]

#     # alice_proposals = get_projects_addresses(1)[:3]
#     alice: LocalAccount = EthAccount.from_key(ALICE)
#     bob: LocalAccount = EthAccount.from_key(BOB)

#     await glm_contracts.approve(alice, deposits_contracts.contract.address, w3.to_wei(10000, "ether"))
#     await deposits_contracts.lock(alice, w3.to_wei(10000, "ether"))

#     await glm_contracts.approve(bob, deposits_contracts.contract.address, w3.to_wei(15000, "ether"))
#     await deposits_contracts.lock(bob, w3.to_wei(15000, "ether"))

#     # glm.approve(alice, deposits.contract.address, w3.to_wei(10000, "ether"))

#     # # lock GLM from two accounts
#     # UserAccount(CryptoAccount.from_key(ALICE), client)
#     # glm.approve(self._account, deposits.contract.address, w3.to_wei(value, "ether"))
#     # deposits.lock(self._account, w3.to_wei(value, "ether"))

#     # ua_alice.lock(10000)
#     # ua_bob.lock(15000)

#     # forward time to the beginning of the epoch 2
#     client.move_to_next_epoch(STARTING_EPOCH + 1)

#     # wait for indexer to catch up
#     epoch_no = client.wait_for_sync(STARTING_EPOCH + 1)
#     app.logger.debug(f"indexed epoch: {epoch_no}")

#     # make a snapshot
#     res = client.pending_snapshot()
#     assert res["epoch"] > 0

#     ua_alice.allocate(1000, alice_proposals)
#     ua_bob.allocate(1000, alice_proposals[:1])

#     allocations, _ = client.get_epoch_allocations(STARTING_EPOCH)
#     unique_donors = set()
#     unique_proposals = set()
#     app.logger.debug(f"Allocations: \n {allocations}")

#     assert len(allocations["allocations"]) == 4
#     for allocation in allocations["allocations"]:
#         unique_donors.add(allocation["donor"])
#         unique_proposals.add(allocation["project"])
#         assert int(allocation["amount"]) > 0
#     app.logger.debug(f"Allocations: {allocations}")
#     assert len(unique_donors) == 2
#     assert len(unique_proposals) == 3
