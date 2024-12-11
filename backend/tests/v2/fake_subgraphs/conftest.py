from __future__ import annotations

from typing import Callable

import pytest
from fastapi import FastAPI

from tests.v2.fake_subgraphs.epochs import FakeEpochsSubgraph
from tests.v2.fake_subgraphs.helpers import FakeEpochEventDetails
from v2.epochs.dependencies import get_epochs_subgraph


@pytest.fixture(scope="function")
def fake_epochs_subgraph_factory(fast_app: FastAPI) -> FakeEpochsSubgraphCallable:
    def _create_fake_epochs_subgraph(epochs_events: list[FakeEpochEventDetails] = None):
        fake_subgraph_epochs = FakeEpochsSubgraph(epochs_events)

        fast_app.dependency_overrides[
            get_epochs_subgraph
        ] = lambda: fake_subgraph_epochs

        return fake_subgraph_epochs

    return _create_fake_epochs_subgraph


FakeEpochsSubgraphCallable = Callable[
    [list[FakeEpochEventDetails] | None], FakeEpochsSubgraph
]
