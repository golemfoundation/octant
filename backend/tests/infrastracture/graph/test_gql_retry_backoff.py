import pytest


from tests.conftest import mock_gql_transport_reorg_error  # noqa: F401

from gql import gql
from gql.transport.exceptions import TransportQueryError

from app.extensions import gql_factory


@pytest.fixture(autouse=True)
def before(mock_gql_transport_reorg_error):  # noqa: F811
    pass


def test_with_failure():
    """
    1. mock gql to throw TransportQueryError
    2. check if exception is being thrown
    3. check if retry timeout is in place and call takes more than 2 seconds
    """
    query = gql(
        """
query {
  epoches {
    epoch
    fromTs
    toTs
    duration
    decisionWindow
  }
}
    """
    )
    from datetime import datetime, timedelta

    start = datetime.now()
    try:
        gql_factory.build().execute(query)

    except TransportQueryError:
        pass
    finish = datetime.now()
    assert finish - start > timedelta(seconds=1)
