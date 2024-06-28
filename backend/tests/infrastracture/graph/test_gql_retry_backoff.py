import pytest
from datetime import datetime, timedelta


from gql import gql
from gql.transport.exceptions import TransportQueryError

from app.extensions import gql_factory


def test_with_failure(mock_failing_gql):
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
    start = datetime.now()
    with pytest.raises(
        TransportQueryError, match="the chain was reorganized while executing the query"
    ):
        gql_factory.build().execute(query)
    finish = datetime.now()
    assert finish - start >= timedelta(seconds=2)
