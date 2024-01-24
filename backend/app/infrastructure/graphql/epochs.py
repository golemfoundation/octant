from flask import current_app as app, g as request_context
from gql import gql

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
    data = request_context.graphql_client.execute(query, variable_values=variables)[
        "epoches"
    ]

    if data:
        app.logger.debug(f"[Subgraph] Received epoch properties: {data[0]}")
        return data[0]
    else:
        app.logger.warning(
            f"[Subgraph] No epoch properties received for epoch number: {epoch_number}"
        )
        raise exceptions.EpochNotIndexed(epoch_number)


def get_epochs_by_range(from_epoch, to_epoch):
    query = gql(
        """
query GetEpochs($fromEpoch: Int!, $toEpoch: Int!) {
  epoches(where: {epoch_gte: $fromEpoch, epoch_lte: $toEpoch}) {
    toTs
    fromTs
    epoch
    duration
    decisionWindow
  }
}
"""
    )

    variables = {"fromEpoch": from_epoch, "toEpoch": to_epoch}

    app.logger.debug(
        f"[Subgraph] Getting list of epochs within range <{from_epoch, to_epoch}>"
    )
    data = request_context.graphql_client.execute(query, variable_values=variables)
    return data["epoches"]


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
    data = request_context.graphql_client.execute(query)
    return data
