from gql import gql

from app.extensions import graphql_client


def get_indexed_block_num() -> int:
    query = gql(
        """
        query {
             _meta {
                block {
                    number
                }
            }
        }
    """
    )
    data = graphql_client.execute(query)
    if data:
        return data["_meta"]["block"]["number"]
    else:
        return 0
