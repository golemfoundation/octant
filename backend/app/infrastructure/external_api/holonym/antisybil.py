import requests
from typing import Tuple, List, Union
from enum import StrEnum
from eth_utils.address import to_checksum_address

ACTION_ID = "123456789"  # Default, holonym-wide ActionID.
# Use different ActionID to prevent tracking between protocols consuming Holonym.
# https://docs.holonym.id/for-developers/custom-sybil-resistance#how-to-set-an-actionid


class CredentialType(StrEnum):
    """
    CredentialType specifies different methods used by Holonym.

    PHONE_NUMBER_VERIFICATION - phone number verification, code is sent also through e2e messengers
    GOV_ID_KYC_WITH_ZK - KYC with zk barrier between provider and address
    E_PASSPORT_ON_DEVICE_WITH_ZK - the most private, on-device only, currently android only
    """

    PHONE_NUMBER_VERIFICATION = "phone"
    GOV_ID_KYC_WITH_ZK = "gov-id"
    E_PASSPORT_ON_DEVICE_WITH_ZK = "epassport"


def check(
    address: str, cred: Union[CredentialType, None] = None
) -> Tuple[bool, List[str]]:
    """
    Check if address has a holonym's SBT.

    Specify credential type. If unspecified, function will query for
    all credential types.

    Returns a tuple. First element is True if address has at least one SBT.
    Second element contains a list credential types for which active SBT was found.
    """
    address = to_checksum_address(address)
    if cred is None:
        creds = list(CredentialType)
    else:
        creds = [cred]

    results = {}
    for cred in creds:
        results[cred] = _call(address, cred)

    has_sbt = any(results.values())
    sbt_type = list({k: v for k, v in results.items() if v}.keys())
    return has_sbt, sbt_type


def _call(address: str, cred: str) -> bool:
    dict = requests.get(
        f"https://api.holonym.io/sybil-resistance/{cred}/optimism?user={address}&action-id={ACTION_ID}"
    ).json()
    return dict["result"]
