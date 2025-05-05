from http import HTTPStatus
from fastapi import FastAPI
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


from v2.delegations.dependencies import (
    DelegationSettings,
    get_delegation_service,
    get_delegation_settings,
)
from tests.v2.factories import FactoriesAggregator


@pytest.mark.asyncio
async def test_check_delegations_exists(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    delegation_settings = DelegationSettings(
        delegation_salt_primary="primary_salt",
        delegation_salt="secondary_salt",
    )
    fast_app.dependency_overrides[get_delegation_settings] = lambda: delegation_settings
    delegation_service = get_delegation_service(fast_session, delegation_settings)

    alice = await factories.users.get_or_create_alice()
    bob = await factories.users.get_or_create_bob()

    primary_hash = delegation_service.hash_primary(alice.address)
    secondary_hash = delegation_service.hash_secondary(bob.address)
    both_hash = delegation_service.hash_both(alice.address, bob.address)

    await factories.score_delegations.create(primary_hash)
    await factories.score_delegations.create(secondary_hash)
    await factories.score_delegations.create(both_hash)

    async with fast_client as client:
        resp = await client.get(f"delegation/check/{alice.address},{bob.address}")

        assert resp.status_code == HTTPStatus.OK
        # We should see both addresses in the response
        assert resp.json() == {"primary": alice.address, "secondary": bob.address}

        # Order should not matter
        resp = await client.get(f"delegation/check/{bob.address},{alice.address}")

        assert resp.status_code == HTTPStatus.OK
        # We should see both addresses in the response
        assert resp.json() == {"primary": alice.address, "secondary": bob.address}


@pytest.mark.asyncio
async def test_check_delegations_exists_but_not_all(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Test that if one address has a delegation, but the other does not,
    we only return the address that has a delegation.
    """
    delegation_settings = DelegationSettings(
        delegation_salt_primary="primary_salt",
        delegation_salt="secondary_salt",
    )
    fast_app.dependency_overrides[get_delegation_settings] = lambda: delegation_settings
    delegation_service = get_delegation_service(fast_session, delegation_settings)

    alice = await factories.users.get_or_create_alice()
    bob = await factories.users.get_or_create_bob()
    charlie = await factories.users.get_or_create_charlie()

    primary_hash = delegation_service.hash_primary(alice.address)
    secondary_hash = delegation_service.hash_secondary(bob.address)
    both_hash = delegation_service.hash_both(alice.address, bob.address)

    # Create a delegation for alice and bob
    await factories.score_delegations.create(primary_hash)
    await factories.score_delegations.create(secondary_hash)
    await factories.score_delegations.create(both_hash)

    async with fast_client as client:
        resp = await client.get(
            f"delegation/check/{alice.address},{bob.address},{charlie.address}"
        )
        assert resp.status_code == HTTPStatus.OK

        # We should see both addresses in the response
        assert resp.json() == {"primary": alice.address, "secondary": bob.address}


@pytest.mark.asyncio
async def test_check_delegations_does_not_exist(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Test that if no addresses have a delegation, we return an empty response.
    """
    delegation_settings = DelegationSettings(
        delegation_salt_primary="primary_salt",
        delegation_salt="secondary_salt",
    )
    fast_app.dependency_overrides[get_delegation_settings] = lambda: delegation_settings

    alice = await factories.users.get_or_create_alice()
    bob = await factories.users.get_or_create_bob()

    async with fast_client as client:
        resp = await client.get(f"delegation/check/{alice.address},{bob.address}")
        assert resp.status_code == HTTPStatus.BAD_REQUEST

        # We should see both addresses in the response
        assert "not exists" in resp.json()["message"]


@pytest.mark.asyncio
async def test_check_delegations_addresses_list_too_long_or_too_short(
    fast_app: FastAPI,
    fast_client: AsyncClient,
    fast_session: AsyncSession,
    factories: FactoriesAggregator,
):
    """
    Test that if no addresses have a delegation, we return an empty response.
    """
    delegation_settings = DelegationSettings(
        delegation_salt_primary="primary_salt",
        delegation_salt="secondary_salt",
    )
    fast_app.dependency_overrides[get_delegation_settings] = lambda: delegation_settings

    _, one = await factories.users.create_random_user()
    _, two = await factories.users.create_random_user()
    _, three = await factories.users.create_random_user()
    _, four = await factories.users.create_random_user()
    _, five = await factories.users.create_random_user()
    _, six = await factories.users.create_random_user()
    _, seven = await factories.users.create_random_user()
    _, eight = await factories.users.create_random_user()
    _, nine = await factories.users.create_random_user()
    _, ten = await factories.users.create_random_user()
    _, eleven = await factories.users.create_random_user()

    async with fast_client as client:
        resp = await client.get(f"delegation/check/{one.address}")
        assert resp.status_code == HTTPStatus.BAD_REQUEST

        # We should see both addresses in the response
        assert "at least 2" in resp.json()["message"]

        addresses = [
            one.address,
            two.address,
            three.address,
            four.address,
            five.address,
            six.address,
            seven.address,
            eight.address,
            nine.address,
            ten.address,
            eleven.address,
        ]
        joined_addresses = ",".join(addresses)
        resp = await client.get(f"delegation/check/{joined_addresses}")
        assert resp.status_code == HTTPStatus.BAD_REQUEST

        # We should see both addresses in the response
        assert "not more than 10" in resp.json()["message"]
