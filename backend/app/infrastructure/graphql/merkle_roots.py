from flask import current_app as app, g as request_context
from gql import gql


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
    result = request_context.graphql_client.execute(query)["vaultMerkleRoots"]
    app.logger.debug(f"[Subgraph] Received merkle roots: {result}")

    return result
