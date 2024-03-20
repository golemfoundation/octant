from flask import current_app as app
from gql import gql

from app.extensions import gql_factory


def get_all_vault_merkle_roots():
    query = gql(
        """
        query {
          vaultMerkleRoots {
            epoch
            root
            timestamp
          }
        }
        """
    )

    app.logger.debug("[Subgraph] Getting all vault merkle roots")
    result = gql_factory.build().execute(query)["vaultMerkleRoots"]
    app.logger.debug(f"[Subgraph] Received merkle roots: {result}")

    return result
