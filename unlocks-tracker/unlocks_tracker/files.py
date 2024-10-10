import json
from typing import List

from config import Config


def save_processing_stage(filename: str, content):
    with open(filename, "w") as json_file:
        json.dump(content, json_file, indent=4)


def save_output(addresses_to_remove_from_allowlist: List):
    with open(
        f"{Config.RESOURCES_OUTPUT_PATH}/addresses_to_remove.txt", "w"
    ) as f:
        for address in addresses_to_remove_from_allowlist:
            f.write(str(address) + "\n")


def read_original_list() -> List[str]:
    with open(Config.ORIGINAL_ALLOW_LIST_PATH, "r") as file:
        return file.readlines()
