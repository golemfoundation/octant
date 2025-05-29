from typing import Literal, List, Annotated

from pydantic import Field
from v2.core.types import Address, OctantModel, BigInteger


class ProjectAllocationItemV1(OctantModel):
    project_address: Annotated[Address, Field(description="Allocation project address")]
    amount: Annotated[
        BigInteger, Field(description="Amount donated to a project, BigInteger (wei)")
    ]


class HistoryItemDataV1(OctantModel):
    amount: Annotated[
        BigInteger | None,
        Field(description="Amount involved in the action, BigInteger (wei)"),
    ] = None
    transaction_hash: Annotated[
        str | None,
        Field(
            None,
            description="Hash of the transaction corresponding to the history item. Field available for locks, unlocks and withdrawals.",
        ),
    ] = None
    epoch: Annotated[
        int | None,
        Field(
            None,
            description="Epoch in which action occurred. Field available only for patron_mode_donation items.",
        ),
    ] = None
    is_manually_edited: Annotated[
        bool | None,
        Field(
            None,
            description="Whether has the allocation been manually edited by the user. Field available only for allocation items.",
        ),
    ] = None
    leverage: Annotated[
        str | None,
        Field(
            None,
            description="Leverage of the allocated funds. Field available only for allocation items.",
        ),
    ] = None
    allocations: Annotated[
        List[ProjectAllocationItemV1] | None,
        Field(
            None,
            description="Project allocation items. Field available only for allocation items.",
        ),
    ] = None


HistoryItemType = Literal[
    "lock", "unlock", "allocation", "withdrawal", "patron_mode_donation"
]


class HistoryItemV1(OctantModel):
    type: Annotated[
        HistoryItemType,
        Field(
            description="Type of action (lock, unlock, allocation, withdrawal, patron_mode_donation)",
        ),
    ]
    timestamp: Annotated[
        str,
        Field(
            description="Timestamp in seconds when the action occurred (since Unix epoch)"
        ),
    ]
    event_data: Annotated[HistoryItemDataV1, Field(description="History event data")]


class UserHistoryResponseV1(OctantModel):
    history: Annotated[
        List[HistoryItemV1], Field(description="History of user actions")
    ]
    next_cursor: Annotated[str | None, Field(None, description="Next page cursor")]
