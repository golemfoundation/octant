from flask import current_app as app
from gql import gql

from app.extensions import gql_factory

from app import exceptions


def get_epoch_by_number(epoch_number):
    query = gql(
        """
query GetEpoch($epochNo: Int!) {
  epoches(where: {epoch: $epochNo}) {
    epoch
    fromTs
    toTs
    duration
    decisionWindow
  }
}
    """
    )

    variables = {"epochNo": epoch_number}
    app.logger.debug(
        f"[Subgraph] Getting epoch properties for epoch number: {epoch_number}"
    )
    data = gql_factory.build().execute(query, variable_values=variables)["epoches"]

    if data:
        app.logger.debug(f"[Subgraph] Received epoch properties: {data[0]}")
        return data[0]
    else:
        app.logger.warning(
            f"[Subgraph] No epoch properties received for epoch number: {epoch_number}"
        )
        raise exceptions.EpochNotIndexed(epoch_number)


def get_epochs():
    query = gql(
        """
query {
  epoches(first: 1000) {
    epoch
    fromTs
    toTs
  }
  _meta {
    block {
      number
    }
  }
}
    """
    )

    app.logger.debug("[Subgraph] Getting list of all epochs")
    data = gql_factory.build().execute(query)
    return data
