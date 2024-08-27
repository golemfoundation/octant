import asyncio
import socketio

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
if __name__ == "__main__":
    asyncio.run(main())
