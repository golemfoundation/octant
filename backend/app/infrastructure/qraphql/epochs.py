from gql import gql

from app.extensions import graphql_client


def get_epoch_by_number(epoch_number):
    query = gql(
        """
        query GetEpoch($id: ID!) {
  epoch(id: $id) {
    fromTs
    toTs
  }
}
    """
    )

    variables = {"id": epoch_number}

    return graphql_client.execute(query, variable_values=variables)["epoch"]
