import requests
from config import Config
from helpers import are_addresses_the_same
from pipeline.daos import SenderDetails
from schemas import TransfersSchema


def retrieve_outgoing_transfers(*senders: SenderDetails) -> TransfersSchema:
    outgoing_transfers = []
    for sender in senders:
        params = Config.ETHERSCAN_PARAMS.copy()

        params["address"] = sender.address
        params["startBlock"] = sender.start_block

        response = requests.get(Config.ETHERSCAN_URL, params=params)

        if response.status_code != 200:
            raise Exception(f"Invalid status code: {response.status_code}")

        result = response.json()["result"]
        for transaction in result:
            if are_addresses_the_same(transaction["from"], sender.address):
                outgoing_transfers.append(transaction)

    return outgoing_transfers
