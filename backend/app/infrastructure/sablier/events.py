from functools import lru_cache
from typing import TypedDict, List, Dict, Set

from flask import current_app as app
from gql import gql

from app.constants import (
    SABLIER_TOKEN_ADDRESS_SEPOLIA,
    SABLIER_SENDER_ADDRESS_SEPOLIA,
    SABLIER_INCORRECTLY_CANCELLED_STREAMS_IDS_SEPOLIA,
    INCORRECTLY_CANCELLED_STREAMS_PATH,
)
from app.extensions import gql_sablier_factory
from app.shared.blockchain_types import compare_blockchain_types, ChainTypes

import pandas as pd


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
    stream_id: str


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
            stream_id = stream.get("id")
            if _check_if_incorrectly_cancelled_stream(stream_id) is True:
                continue

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
                    id=stream_id,
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


@lru_cache(maxsize=1)
def _retrieve_incorrectly_cancelled_streams() -> Set[int]:
    incorrectly_cancelled_streams_ids = set()
    chain_id = app.config["CHAIN_ID"]

    if compare_blockchain_types(chain_id, ChainTypes.SEPOLIA):
        incorrectly_cancelled_streams_ids = (
            SABLIER_INCORRECTLY_CANCELLED_STREAMS_IDS_SEPOLIA
        )
    elif compare_blockchain_types(chain_id, ChainTypes.MAINNET):
        incorrectly_cancelled_streams_ids = set(
            pd.read_csv(INCORRECTLY_CANCELLED_STREAMS_PATH, sep=";")[
                "streamid"
            ].to_list()
        )

    return incorrectly_cancelled_streams_ids


def _check_if_incorrectly_cancelled_stream(source_stream_id: str) -> bool:
    """
    This function fixes the issue with incorrectly cancelled streams.
    It suppresses the streams based on the data/cancelled_streams.csv file for mainnet.

    Source stream id is the stream id from the subgraph. Its format is: "0x{stream_id}-<nr>-<num_id>".
    The last part of the stream id is the id from the source of truth.
    """
    processed_stream_id = int(source_stream_id.split("-")[-1])
    incorrectly_cancelled_streams_ids = _retrieve_incorrectly_cancelled_streams()
    return processed_stream_id in incorrectly_cancelled_streams_ids
