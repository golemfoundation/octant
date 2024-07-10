import pytest

from gql import gql
from gql.transport.exceptions import TransportQueryError

from app.extensions import gql_factory

from app.infrastructure import Client as GQLClient


def test_with_failure(mock_failing_gql):
    """
    1. mock gql to throw TransportQueryError
    2. mocks datetime.now() and time.sleep() to allow for checking backoff
    3. check if execute_sync (request) was called at least 2 times (1st call + at least 1 retry)
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
    with pytest.raises(
        TransportQueryError, match="the chain was reorganized while executing the query"
    ):
        gql_factory.build().execute(query)

    assert (
        GQLClient.execute_sync.call_count > 2
    ), f"Testing retry backoff, need more at least than 2 calls, got {GQLClient.execute_sync.call_count}"
