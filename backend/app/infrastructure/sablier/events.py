from typing import TypedDict, List, Dict

from flask import current_app as app
from gql import gql

from app.extensions import gql_sablier_factory
from app.constants import SABLIER_TOKEN_ADDRESS_SEPOLIA, SABLIER_SENDER_ADDRESS_SEPOLIA
from app.shared.blockchain_types import compare_blockchain_types, ChainTypes


class SablierAction(TypedDict):
    category: str
    addressA: str
    addressB: str
    amountA: int
    amountB: int
    timestamp: int
    hash: str


class SablierStream(TypedDict):
    id: str
    actions: List[SablierAction]
    intactAmount: str
    canceled: bool
    endTime: str
    depositAmount: str
    recipient: str


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
            is_cancelled = stream.get("canceled")
            end_time = stream.get("endTime")
            deposit_amount = stream.get("depositAmount")
            recipient = stream.get("recipient")

            all_streams.append(
                SablierStream(
                    actions=actions,
                    intactAmount=final_intact_amount,
                    canceled=is_cancelled,
                    endTime=end_time,
                    depositAmount=deposit_amount,
                    recipient=recipient,
                )
            )

        if len(streams) < limit:
            has_more = False
        else:
            skip += limit

    return all_streams


def get_user_events_history(user_address: str) -> List[SablierStream]:
    """
    Get all the locks and unlocks for a user.
    Query used for computing user's effective deposit and getting all sablier streams from an endpoint.
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
            canceled
            endTime
            depositAmount
            recipient
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
            canceled
            endTime
            depositAmount
            recipient
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
    chain_id = app.config["CHAIN_ID"]
    sender = (
        app.config["SABLIER_SENDER_ADDRESS"]
        if compare_blockchain_types(chain_id, ChainTypes.MAINNET)
        else SABLIER_SENDER_ADDRESS_SEPOLIA
    )
    return sender


def _get_token_address():
    chain_id = app.config["CHAIN_ID"]
    token_address = (
        app.config["GLM_TOKEN_ADDRESS"]
        if compare_blockchain_types(chain_id, ChainTypes.MAINNET)
        else SABLIER_TOKEN_ADDRESS_SEPOLIA
    )
    return token_address
