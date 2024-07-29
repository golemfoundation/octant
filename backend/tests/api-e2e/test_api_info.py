import pytest

from tests.conftest import Client
from tests.helpers.constants import STARTING_EPOCH


@pytest.mark.api
def test_info_basics(
    client: Client,
):
    # Check chain_info
    chain_info, status_code = client.get_chain_info()
    assert "chainName" in chain_info
    assert "chainId" in chain_info
    assert "smartContracts" in chain_info
    assert status_code == 200

    # Check healthcheck
    healthcheck, status_code = client.get_healthcheck()
    assert healthcheck["blockchain"] == "UP"
    assert healthcheck["db"] == "UP"
    assert healthcheck["subgraph"] == "UP"
    assert status_code == 200

    # Check version
    version, status_code = client.get_version()
    assert "id" in version
    assert "env" in version
    assert "chain" in version
    assert status_code == 200

    # Check sync_status
    sync_status, status_code = client.sync_status()
    assert sync_status["blockchainEpoch"] == STARTING_EPOCH
    assert sync_status["indexedEpoch"] == STARTING_EPOCH
