from dataclasses import dataclass

from v2.core.types import Address


@dataclass
class FakeEpochsContractDetails:
    is_decision_window_open: bool = False
    decision_window_length: int = False
    current_epoch: int = 0
    pending_epoch: int = None
    finalized_epoch: int = 0
    current_epoch_end: int = 0
    epoch_duration: int = 0
    future_epoch_props: dict = None
    is_started: bool = False
    started: int = 0


@dataclass
class FakeProjectDetails:
    address: Address
    epoch_number: int


@dataclass
class FakeProjectsContractDetails:
    projects_cid: str
    projects_details: list[FakeProjectDetails]
