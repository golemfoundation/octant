from __future__ import annotations

from typing import Callable

import pytest
from fastapi import FastAPI

from tests.v2.fake_contracts.epochs import FakeEpochsContract
from tests.v2.fake_contracts.helpers import FakeEpochsContractDetails
from v2.epochs.dependencies import get_epochs_contracts


@pytest.fixture(scope="function")
def fake_epochs_contract_factory(fast_app: FastAPI) -> FakeEpochsContractCallable:
    def _create_fake_epochs_contract(
        epochs_details_for_contract: FakeEpochsContractDetails | None = None,
    ):
        fake_epochs_contract = FakeEpochsContract(epochs_details_for_contract)

        fast_app.dependency_overrides[
            get_epochs_contracts
        ] = lambda: fake_epochs_contract

        return fake_epochs_contract

    return _create_fake_epochs_contract


FakeEpochsContractCallable = Callable[
    [FakeEpochsContractDetails | None], FakeEpochsContract
]
