import asyncio
import json
import multiprocessing
import os
import random
import sys
import socketio

import time
import requests
from app.legacy.crypto.eip712 import sign
from v2.allocations.validators import build_allocations_eip712_data

from eth_account.signers.local import LocalAccount
from eth_account import Account as EthAccount



events = []

pre_allocate = True
donors_count = 0


sio = socketio.AsyncClient(logger=False, engineio_logger=False)


# Define event handlers
@sio.on("connect")
async def connect():
    events.append({"event": "connect", "time": time.time()})

@sio.event
async def connect_error(data):
    events.append({"event": "connect_error", "data": data, "time": time.time()})
    await sio.disconnect()

@sio.on("connect_error")
async def connect_error(data):
    events.append({"event": "connect_error", "data": data, "time": time.time()})
    await sio.disconnect()

@sio.on("disconnect")
async def disconnect():
    events.append({"event": "disconnect", "time": time.time()})

@sio.on("project_rewards")
async def project_rewards(data):
    events.append({"event": "project_rewards_received", "data": data, "time": time.time()})

@sio.on("project_donors")
async def project_donors(data):
    global donors_count
    if pre_allocate:
        donors_count += 1
    else:
        donors_count -= 1
    events.append({"event": "project_donors_received", "data": data, "time": time.time()})

@sio.on("threshold")
async def threshold(data):
    events.append({"event": "threshold_received", "data": data, "time": time.time()})

chain_id = 11155111  # Sepolia




mine0 = os.getenv("MINE_KEY", None)
me: LocalAccount = EthAccount.from_key(mine0)

# UAT projects
# project_addresses = [
#     "0xc6FD734790E83820e311211B6d9A682BCa4ac97b",
#     "0x242ba6d68FfEb4a098B591B32d370F973FF882B7",
# ]
project_addresses = [
    "0x0B7246eF74Ca7b37Fdc3D15be4f0b49876622F95",
    "0x0cbF31Ef6545EE30f47651D1A991Bf0aeB03DF29",
    "0x1c01595f9534E33d411035AE99a4317faeC4f6Fe",
]


allocation_info = {
    "request": None,
    "signature_duration": None,
    "send_time": None,
}

async def allocate():
    # Emit a custom event

    events.append({"event": "nonce_request", "time": time.time()})

    try:
        # url = f"https://uat-backend.octant.wildland.dev/allocations/users/{me.address}/allocation_nonce"
        # url = f"https://master-backend.octant.wildland.dev/allocations/users/{me.address}/allocation_nonce"
        url = f"http://127.0.0.1:5000/allocations/users/{me.address}/allocation_nonce"
        # url = f"http://127.0.0.1:5000/flask/allocations/users/{me.address}/allocation_nonce"
        nonce = requests.get(url).json()['allocationNonce']

        events.append({"event": "nonce_response", "data": nonce, "time": time.time()})

    except Exception as e:

        events.append({"event": "error_nonce", "data": str(e), "time": time.time()})
        await sio.disconnect()
        return

    sig_time = time.time()

    random_mult = random.random()
    amout = int(12223333 * random_mult)
    # print("Amount: ", amout)    

    payload = {
        "allocations": [
            {
                "proposalAddress": address,
                "amount": amout,
            }
            for address in project_addresses
        ],
        "nonce": nonce,
    }

    events.append({"event": "payload_generated", "data": payload, "time": time.time()})

    data = build_allocations_eip712_data(chain_id, payload)

    signature = sign(me, data)

    request_data = {
        "userAddress": me.address,
        "payload": payload,
        "signature": signature,
        "isManuallyEdited": False,
    }

    # print("signature: ", signature)
    # print("payload: ", payload)

    # print("time taken for signature: ", time.time() - sig_time)

    events.append({"event": "allocate_request", "data": request_data, "time": time.time()})

    # await sio.emit("allocate", json.dumps(request_data))

    resp = requests.post(
        # "https://uat-backend.octant.wildland.dev/allocations/allocate",
        # "https://master-backend.octant.wildland.dev/allocations/allocate",
        "http://127.0.0.1:5000/allocations/allocate",
        # "http://127.0.0.1:5000/flask/allocations/allocate",
        json=request_data,
    )

    events.append({"event": "allocate_response", "data": resp.json(), "time": time.time(), "status_code": resp.status_code})


    # print("donors_count: ", donors_count)

    global pre_allocate
    pre_allocate = False
    


from uuid import uuid4

async def run_ws():

    for i in range(10):

        global pre_allocate
        global donors_count
        global events

        donors_count = 0
        events = []
        pre_allocate = True

        print(f"Running test {i:02d} : {me.address[:6]}")

        try:
            # await sio.connect('https://uat-backend.octant.wildland.dev/', wait_timeout=10)
            await sio.connect('https://master-backend.octant.wildland.dev/', wait_timeout=10)
            await allocate()
            # Wait till donors count is 0 again
            while donors_count > 0:
                await asyncio.sleep(0.3)
            await sio.disconnect()
        except Exception as e:
            events.append({"event": "error", "data": str(e), "time": time.time()})
            await sio.disconnect()

        with open(f"ws_logs/events_{uuid4()}.json", "w") as f:
            json.dump(events, f, indent=4)


async def run_request():

    for i in range(1):
            
        global pre_allocate
        global donors_count
        global events

        donors_count = 0
        events = []
        pre_allocate = True

        print(f"Running test {i:02d} : {me.address[:6]}")

        try:
            await allocate()
        except Exception as e:
            events.append({"event": "error", "data": str(e), "time": time.time()})

        with open(f"wr_logs/events_{uuid4()}.json", "w") as f:
            json.dump(events, f, indent=4)



# Main function to start the test
if __name__ == "__main__":
    # num_connections = 2  # Number of concurrent connections
    # metrics = run_concurrent_connections(num_connections)
    # print_metrics(metrics)

    asyncio.run(run_request())