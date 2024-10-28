from typing import TypedDict, List, Dict

from flask import current_app as app
from gql import gql

from app.extensions import gql_sablier_factory


class SablierAction(TypedDict):
    category: str
    addressA: str
    addressB: str
    amountA: int
    amountB: int
    timestamp: int
    hash: str


class SablierStream(TypedDict):
    actions: List[SablierAction]
    intactAmount: int


def fetch_streams(query: str, variables: Dict) -> List[SablierStream]:
    """
    Fetch streams with retry logic for pagination.
    """
    all_streams = []
    has_more = True
    limit = 1000
    skip = 0

    while has_more:
        variables.update({"limit": limit, "skip": skip})

        app.logger.debug(f"[Sablier Subgraph] Querying streams with skip: {skip}")
        result = gql_sablier_factory.build().execute(
            gql(query), variable_values=variables
        )

        streams = result.get("streams", [])

        app.logger.debug(f"[Sablier Subgraph] Received {len(streams)} streams.")

        for stream in streams:
            actions = stream.get("actions", [])
            final_intact_amount = stream.get("intactAmount", 0)
            all_streams.append(
                SablierStream(actions=actions, intactAmount=final_intact_amount)
            )

        if len(streams) < limit:
            has_more = False
        else:
            skip += limit

    return all_streams


def get_user_events_history(user_address: str) -> List[SablierStream]:
    """
    Get all the locks and unlocks for a user.
    """
    query = """
        query GetEvents($sender: String!, $recipient: String!, $tokenAddress: String!, $limit: Int!, $skip: Int!) {
          streams(
            where: {
              sender: $sender
              recipient: $recipient
              asset_: {address: $tokenAddress}
              transferable: false
            }
            first: $limit
            skip: $skip
            orderBy: timestamp
          ) {
            id
            intactAmount
            actions(where: {category_in: [Cancel, Withdraw, Create]}, orderBy: timestamp) {
              category
              addressA
              addressB
              amountA
              amountB
              timestamp
              hash
            }
          }
        }
    """
    variables = {
        "sender": _get_sender(),
        "recipient": user_address,
        "tokenAddress": _get_token_address(),
    }

    streams = fetch_streams(query, variables)
    return streams


def get_all_streams_history() -> List[SablierStream]:
    """
    Get all the locks and unlocks in history.
    """
    query = """
        query GetAllEvents($sender: String!, $tokenAddress: String!, $limit: Int!, $skip: Int!) {
          streams(
            where: {
              sender: $sender
              asset_: {address: $tokenAddress}
              transferable: false
            }
            first: $limit
            skip: $skip
            orderBy: timestamp
          ) {
            id
            intactAmount
            actions(where: {category_in: [Cancel, Withdraw, Create]}, orderBy: timestamp) {
              category
              addressA
              addressB
              amountA
              amountB
              timestamp
              hash
            }
          }
        }
    """
    variables = {
        "sender": _get_sender(),
        "tokenAddress": _get_token_address(),
    }

    return fetch_streams(query, variables)


def _get_sender():
    return app.config["SABLIER_SENDER_ADDRESS"]


def _get_token_address():
    return app.config["GLM_TOKEN_ADDRESS"]
