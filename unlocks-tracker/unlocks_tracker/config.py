import os
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()


class Config:
    GOLEM_ADDRESSES = [
        "0xebe45812659d8a4fcc0703d478aba0ba56e49d9c",
        "0x1e90474d2e83e7b7dd45553156beb316845e66a4",
    ]

    ORGANIZATIONS_ADDRESS = os.getenv("ORGANIZATION_ADDRESSES").split(",")
    KARLAGODETH_ADDRESS = ORGANIZATIONS_ADDRESS[2]

    EXCLUDED_ADDRESSES = [
        "0x879133fd79b7f48ce1c368b0fca9ea168eaf117c",
        "0x00000000009726632680fb29d3f7a9734e3010e2",
    ]  # Deposit Contract, Rainbow Router

    ETHERSCAN_PARAMS = {
        "module": "account",
        "action": "tokentx",
        "address": None,
        "sort": "asc",
        "apikey": os.getenv("ETHERSCAN_API_KEY"),
        "startblock": None,
    }

    ETHERSCAN_URL = "https://api.etherscan.io/api"
    # We started the promotion action 78 days ago, the first outgoing transfer;
    # TX hash:
    # 0xe3e6b5db8651f67e7bfb3391af6d2c834344453eea79cfd6d562fcf0fdb52e55
    GOLEM_FIRST_OUT_TRANSFER_BLOCK = 20334443
    END_OF_PROMOTION_TS = int(
        datetime(
            int(os.getenv("END_OF_PROMOTION_YEAR")),
            int(os.getenv("END_OF_PROMOTION_MONTH")),
            int(os.getenv("END_OF_PROMOTION_DAY")),
        ).timestamp()
    )
    DEADLINE_IN_DAYS = int(os.getenv("DEADLINE_IN_DAYS"))
    ORIGINAL_ALLOW_LIST_PATH = "resources/input/addresses.txt"
    RESOURCES_OUTPUT_PATH = "resources/output"
