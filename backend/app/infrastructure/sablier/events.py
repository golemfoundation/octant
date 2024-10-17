import os
from typing import TypedDict, List, Dict, Optional

from app.extensions import gql_sablier_factory
from flask import current_app as app
from gql import gql


class SablierStream(TypedDict):
    id: str
    intactAmount: int
    actions: List[Dict]


def get_user_events_history(user_address: str) -> Optional[SablierStream]:
    """
    Get all the locks and unlocks for a user.
    """
    query = gql(
        """
        query GetEvents($sender: String!, $recipient: String!, $tokenAddress: String!) {
          streams(
            where:{
              sender: $sender
              recipient: $recipient
              asset_: {address: $tokenAddress}
              transferable: false
            }
          )
          {
            id
            intactAmount
            actions (where: {category_in: [Cancel, Withdraw, Create]}, orderBy: timestamp) {
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
    )

    variables = {
        "sender": _get_sender(),
        "recipient": user_address,
        "tokenAddress": _get_token_address(),
    }

    app.logger.debug(f"[Sablier Subgraph] Getting user {user_address} events.")

    result = gql_sablier_factory.build().execute(query, variable_values=variables)

    app.logger.debug(f"[Sablier Subgraph] Received locks: {result}")

    return result["streams"][0] if len(result["streams"]) > 0 else None


def get_all_events_history() -> SablierStream:
    """
    Get all the locks and unlocks in history.
    """
    query = gql(
        """
        query GetAllEvents($sender: String!, $tokenAddress: String!) {
          streams(
            where:{
              sender: $sender
              asset_: {address: $tokenAddress}
              transferable: false
            }
          )
          {
            id
            intactAmount
            actions (where: {category_in: [Cancel, Withdraw, Create]}, orderBy: timestamp) {
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
    )
    variables = {
        "sender": _get_sender(),
        "tokenAddress": _get_token_address(),
    }
    app.logger.debug("[Sablier Subgraph] Getting all events from Sablier.")
    result = gql_sablier_factory.build().execute(query, variable_values=variables)[
        "streams"
    ]
    app.logger.debug(f"[Sablier Subgraph] Received all events: {result}")

    return result["data"]["streams"][0]


def _get_sender():
    return os.getenv("SABLIER_SENDER_ADDRESS")


def _get_token_address():
    return os.getenv("GLM_TOKEN_ADDRESS")
