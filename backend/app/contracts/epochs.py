from typing import Dict

from flask import current_app as app
from web3 import exceptions

from app.contracts.smart_contract import SmartContract


class Epochs(SmartContract):
    def is_decision_window_open(self) -> bool:
        app.logger.debug("[Epochs contract] Checking if decision window is open")
        return self.contract.functions.isDecisionWindowOpen().call()

    def get_current_epoch(self) -> int:
        try:
            app.logger.debug("[Epochs contract] Getting current epoch")
            return self.contract.functions.getCurrentEpoch().call()
        except exceptions.ContractLogicError:
            app.logger.warning("[Epochs contract] Current epoch not started yet")
            # HN:Epochs/not-started-yet
            return 0

    def get_pending_epoch(self) -> int:
        try:
            app.logger.debug("[Epochs contract] Getting pending epoch")
            return self.contract.functions.getPendingEpoch().call()
        except exceptions.ContractLogicError:
            app.logger.warning("[Epochs contract] No pending epoch")
            # HN:Epochs/not-pending
            return 0

    def get_finalized_epoch(self) -> int:
        try:
            app.logger.debug("[Epochs contract] Getting finalized epoch")
            return self.contract.functions.getFinalizedEpoch().call()
        except exceptions.ContractLogicError:
            app.logger.warning("[Epochs contract] No finalized epoch")
            # HN:Epochs/not-finalized
            return 0

    def get_future_epoch_props(self) -> Dict:
        app.logger.debug("[Epochs contract] Getting epoch props index")
        index = self.contract.functions.epochPropsIndex().call()
        app.logger.debug("[Epochs contract] Getting next epoch props")
        return self.contract.functions.epochProps(index).call()
