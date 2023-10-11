import pytest

from tests.conftest import client


@pytest.mark.api
def test_root(client):
    rv = client.get("/")
    assert b"Octant API" in rv.data
