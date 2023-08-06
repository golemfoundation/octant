from flask import g as request_context
from gql import gql


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
    data = request_context.graphql_client.execute(query)
    if data:
        return data["_meta"]["block"]["number"]
    else:
        return 0
