from flask import current_app as app, g as request_context
from gql import gql

from app import exceptions


def get_epoch_by_number(epoch_number):
    query = gql(
        """
        query GetEpoch($epochNo: Int!) {
  epoches(where: {epoch: $epochNo}) {
    fromTs
    toTs
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
