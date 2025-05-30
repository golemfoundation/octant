from http import HTTPStatus

import pytest
from fastapi import FastAPI
from httpx import AsyncClient
from v2.core.transformers import transform_to_checksum_address as to_checksum_address


@pytest.mark.asyncio
async def test_get_chain_info(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    monkeypatch,
):
    """Should return chain information and contract addresses with checksummed addresses"""
    # Step 1: Define mixed-case non-checksummed addresses to use in environment variables
    auth_address_raw = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    deposits_address_raw = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    epochs_address_raw = "0xcccccccccccccccccccccccccccccccccccccccc"
    glm_address_raw = "0xdddddddddddddddddddddddddddddddddddddddd"
    projects_address_raw = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
    vault_address_raw = "0xfedcba9876543210fedcba9876543210fedcba98"
    withdrawals_target_address_raw = "0xabcdef1234567890abcdef1234567890abcdef12"

    # Expected checksummed versions for verification
    auth_address = to_checksum_address(auth_address_raw)
    deposits_address = to_checksum_address(deposits_address_raw)
    epochs_address = to_checksum_address(epochs_address_raw)
    glm_address = to_checksum_address(glm_address_raw)
    projects_address = to_checksum_address(projects_address_raw)
    vault_address = to_checksum_address(vault_address_raw)
    withdrawals_target_address = to_checksum_address(withdrawals_target_address_raw)

    # Verify the withdrawals address is different when checksummed (for testing purposes)
    assert auth_address != auth_address_raw
    assert deposits_address != deposits_address_raw
    assert epochs_address != epochs_address_raw
    assert glm_address != glm_address_raw
    assert projects_address != projects_address_raw
    assert vault_address != vault_address_raw
    assert withdrawals_target_address != withdrawals_target_address_raw

    # Step 2: Set up environment variables using monkeypatch
    monkeypatch.setenv("CHAIN_NAME", "TestChain")
    monkeypatch.setenv("CHAIN_ID", "1337")
    monkeypatch.setenv("AUTH_CONTRACT_ADDRESS", auth_address_raw)
    monkeypatch.setenv("DEPOSITS_CONTRACT_ADDRESS", deposits_address_raw)
    monkeypatch.setenv("EPOCHS_CONTRACT_ADDRESS", epochs_address_raw)
    monkeypatch.setenv("GLM_CONTRACT_ADDRESS", glm_address_raw)
    monkeypatch.setenv(
        "PROPOSALS_CONTRACT_ADDRESS", projects_address_raw
    )  # Note: Uses PROPOSALS not PROJECTS
    monkeypatch.setenv("VAULT_CONTRACT_ADDRESS", vault_address_raw)
    monkeypatch.setenv(
        "WITHDRAWALS_TARGET_CONTRACT_ADDRESS", withdrawals_target_address_raw
    )

    # Step 3: Call the API endpoint
    async with fast_client as client:
        resp = await client.get("info/chain-info")
        assert resp.status_code == HTTPStatus.OK
        result = resp.json()

        # Step 4: Verify the chain info
        assert result["chainName"] == "TestChain"
        assert result["chainId"] == 1337

        # Step 5: Verify the contract addresses are matched (& checksummed)
        contracts = {
            contract["name"]: contract["address"]
            for contract in result["smartContracts"]
        }
        assert contracts["Auth"] == auth_address
        assert contracts["Deposits"] == deposits_address
        assert contracts["Epochs"] == epochs_address
        assert contracts["GLM"] == glm_address
        assert contracts["Projects"] == projects_address
        assert contracts["Vault"] == vault_address
        assert contracts["WithdrawalsTarget"] == withdrawals_target_address

        # Step a7: Verify all addresses are checksummed
        for contract in result["smartContracts"]:
            # Address in response should equal checksummed version of input
            assert contract["address"] == to_checksum_address(contract["address"])
