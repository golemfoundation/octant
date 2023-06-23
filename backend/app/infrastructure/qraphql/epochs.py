from gql import gql

from app.extensions import graphql_client
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

    data = graphql_client.execute(query, variable_values=variables)["epoches"]

    if data:
        return data[0]
    else:
        raise exceptions.EpochNotIndexed(epoch_number)
