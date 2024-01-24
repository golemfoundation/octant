from flask import current_app as app, g as request_context
from gql import gql

from app import exceptions


EPOCH_1 = {
    "id": "0x01000000",
    "epoch": 1,
    "duration": "6220800",
    "decisionWindow": "1209600",
    "fromTs": "1691510400",
    "toTs": "1697731200",
}
EPOCH_2 = {
    "id": "0x02000000",
    "epoch": 2,
    "duration": "7776000",
    "decisionWindow": "1209600",
    "fromTs": "1697731200",
    "toTs": "1705507200",
}


def get_epoch_by_number(epoch_number):
    query = gql(
        """
query GetEpochs {
  epoches(first: 1000) {
    epoch
    fromTs
    toTs
    duration
    decisionWindow
  }
}
    """
    )

    app.logger.debug(
        f"[Subgraph] Getting epoch properties for epoch number: {epoch_number}"
    )
    data = request_context.graphql_client.execute(query)
    if app.config["SHOULD_HARDCODE_EPOCHS_1_AND_2"]:
        _insert_hardcoded_epochs(data)

    filtered_epochs = [e for e in data["epoches"] if e["epoch"] == epoch_number]

    if filtered_epochs:
        app.logger.debug(f"[Subgraph] Received epoch properties: {filtered_epochs[0]}")
        return filtered_epochs[0]
    else:
        app.logger.warning(
            f"[Subgraph] No epoch properties received for epoch number: {epoch_number}"
        )
        raise exceptions.EpochNotIndexed(epoch_number)


def get_epochs_by_range(from_epoch, to_epoch):
    query = gql(
        """
query GetEpochs {
  epoches(first: 1000) {
    epoch
    fromTs
    toTs
    duration
    decisionWindow
  }
}
"""
    )

    app.logger.debug(
        f"[Subgraph] Getting list of epochs within range <{from_epoch, to_epoch}>"
    )
    data = request_context.graphql_client.execute(query)
    if app.config["SHOULD_HARDCODE_EPOCHS_1_AND_2"]:
        _insert_hardcoded_epochs(data)

    filtered_epochs = [
        e for e in data["epoches"] if e["epoch"] >= from_epoch or e["epoch"] <= to_epoch
    ]

    return filtered_epochs


def get_epochs():
    query = gql(
        """
query {
  epoches(first: 1000) {
    epoch
    fromTs
    toTs
  }
  _meta {
    block {
      number
    }
  }
}
    """
    )

    app.logger.debug("[Subgraph] Getting list of all epochs")
    data = request_context.graphql_client.execute(query)
    if app.config["SHOULD_HARDCODE_EPOCHS_1_AND_2"]:
        _insert_hardcoded_epochs(data)

    return data


def _insert_hardcoded_epochs(data):
    epochs = data["epoches"]
    epoch1 = [e for e in epochs if e["epoch"] == 1]
    epoch2 = [e for e in epochs if e["epoch"] == 2]

    if not epoch1:
        epochs.insert(0, EPOCH_1)
    if not epoch2:
        epochs.insert(1, EPOCH_2)
