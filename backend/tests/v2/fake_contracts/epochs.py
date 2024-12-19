from tests.v2.fake_contracts.helpers import FakeEpochsContractDetails


class FakeEpochsContract:
    def __init__(self, epochs_details_for_contract: FakeEpochsContractDetails):
        self.epochs_details_for_contract = epochs_details_for_contract

    async def get_current_epoch(self) -> int:
        return self.epochs_details_for_contract.current_epoch

    async def get_pending_epoch(self) -> int:
        return self.epochs_details_for_contract.pending_epoch

    async def get_finalized_epoch(self) -> int:
        return self.epochs_details_for_contract.finalized_epoch

    async def get_current_epoch_end(self) -> int:
        return self.epochs_details_for_contract.current_epoch_end

    async def get_epoch_duration(self) -> int:
        return self.epochs_details_for_contract.epoch_duration

    async def get_future_epoch_props(self) -> dict:
        return self.epochs_details_for_contract.future_epoch_props

    async def is_started(self) -> bool:
        return self.epochs_details_for_contract.is_started

    async def start(self) -> int:
        return self.epochs_details_for_contract.started

    async def is_decision_window_open(self) -> bool:
        return self.epochs_details_for_contract.is_decision_window_open

    async def get_decision_window(self) -> int:
        return self.epochs_details_for_contract.decision_window_length
