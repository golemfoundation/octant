import json
import os
from typing import List

import requests
from bs4 import BeautifulSoup

from config import Config, ProjectDetails
from core import is_valid_ethereum_address


def get_addresses_from_cid(cid: str):
    """
    Retrieves a list of Ethereum addresses from the CID by parsing the HTML content.

    :param cid: The CID to fetch.
    :param gateway_url: The base URL of the IPFS gateway.
    :return: A list of Ethereum addresses found under the CID.
    """
    gateway_url = Config.GATEWAY_URL
    url = f"{gateway_url}{cid}/"  # Ensure the trailing slash
    try:
        response = requests.get(url)
        response.raise_for_status()
        html_content = response.text

        soup = BeautifulSoup(html_content, "html.parser")
        addresses = []
        for link in soup.find_all("a"):
            href = link.get("href")
            if href and href not in ("../", "?", ""):
                address = os.path.basename(href)
                address = address.strip("/")

                if is_valid_ethereum_address(address):
                    addresses.append(address)
        return addresses
    except requests.exceptions.RequestException as e:
        print(f"Error fetching CID {cid}: {e}")
        return []


def get_json_data_from_address(
    cid: str, address: str, gateway_url: str = "https://octant.infura-ipfs.io/ipfs/"
):
    """
    Fetches the JSON data from the given Ethereum address under the CID.

    :param cid: The CID under which the address resides.
    :param address: The Ethereum address (file name) to fetch.
    :param gateway_url: The base URL of the IPFS gateway.
    :return: A dictionary containing the JSON data, or None if an error occurs.
    """
    url = f"{gateway_url}{cid}/{address}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        content_type = response.headers.get("Content-Type", "")

        if "application/json" in content_type:
            json_data = response.json()
        else:
            json_data = json.loads(response.text)
        return json_data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching address {address} under CID {cid}: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON from address {address} under CID {cid}: {e}")
        return None


def extract_details_from_json(json_data, *, details_to_extract: List[ProjectDetails]):
    """
    Extracts the 'name' field from the JSON data.

    :param json_data: The JSON data dictionary.
    :return: The 'name' value, or None if not found.
    """
    output = {}
    for detail_to_extract in details_to_extract:
        detail_to_extract = detail_to_extract.value
        output[detail_to_extract] = json_data.get(detail_to_extract)
    return output


def main():
    all_projects_details = []

    for cid in Config.CID:
        print(f"\nProcessing CID: {cid}")
        addresses = get_addresses_from_cid(cid)
        if not addresses:
            print(f"No Ethereum addresses found under CID {cid}.")
            continue

        projects_details = []
        for address in addresses:
            json_data = get_json_data_from_address(cid, address)
            if json_data:
                project_details = extract_details_from_json(
                    json_data, details_to_extract=[ProjectDetails.NAME]
                )
                project_details["address"] = address

                name = project_details.get(ProjectDetails.NAME.value)
                projects_details.append(project_details)

                print(f"Project name for address {address}: {name}")
            else:
                print(f"Failed to retrieve JSON data for address: {address}")

        print(f"Number of projects for {cid}", len(projects_details))
        all_projects_details.append(projects_details)

    print(f"All projects details that are saved in a JSON file: {all_projects_details}")

    with open(Config.JSON_FILEPATH, "w") as f:
        json.dump(all_projects_details, f, indent=4)


if __name__ == "__main__":
    main()
