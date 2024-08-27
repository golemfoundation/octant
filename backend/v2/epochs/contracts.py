import logging
from typing import Dict, Optional

from v2.core.contracts import SmartContract
from web3 import exceptions


class EpochsContracts(SmartContract):
    async def is_decision_window_open(self) -> bool:
        logging.debug("[Epochs contract] Checking if decision window is open")
        return await self.contract.functions.isDecisionWindowOpen().call()

    async def get_decision_window(self) -> bool:
        logging.debug("[Epochs contract] Checking decision window length")
        return await self.contract.functions.getDecisionWindow().call()

    async def get_current_epoch(self) -> int:
        try:
            logging.debug("[Epochs contract] Getting current epoch")
            return await self.contract.functions.getCurrentEpoch().call()
        except exceptions.ContractLogicError:
            logging.warning("[Epochs contract] Current epoch not started yet")
            # HN:Epochs/not-started-yet
            return 0

    async def get_pending_epoch(self) -> Optional[int]:
        try:
            logging.debug("[Epochs contract] Getting pending epoch")
            # return 5
            return await self.contract.functions.getPendingEpoch().call()
        except exceptions.ContractLogicError:
            logging.warning("[Epochs contract] No pending epoch")
            # HN:Epochs/not-pending
            return None

    async def get_finalized_epoch(self) -> int:
        try:
            logging.debug("[Epochs contract] Getting finalized epoch")
            return await self.contract.functions.getFinalizedEpoch().call()
        except exceptions.ContractLogicError:
            logging.warning("[Epochs contract] No finalized epoch")
            # HN:Epochs/not-finalized
            return 0

    async def get_current_epoch_end(self) -> int:
        logging.debug("[Epochs contract] Checking when current epoch ends")
        return await self.contract.functions.getCurrentEpochEnd().call()

    async def get_epoch_duration(self) -> int:
        logging.debug("[Epochs contract] Checking epoch duration")
        return await self.contract.functions.getEpochDuration().call()

    async def get_future_epoch_props(self) -> Dict:
        logging.debug("[Epochs contract] Getting epoch props index")
        index = await self.contract.functions.epochPropsIndex().call()
        logging.debug("[Epochs contract] Getting next epoch props")
        return await self.contract.functions.epochProps(index).call()

    async def is_started(self) -> bool:
        logging.debug("[Epochs contract] Checking if first epoch has started")
        return await self.contract.functions.isStarted().call()

    async def start(self) -> int:
        logging.debug("[Epochs contract] Checking when first epochs starts")
        return await self.contract.functions.start().call()


EPOCHS_ABI = [
    {
        "inputs": [],
        "name": "getCurrentEpoch",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getCurrentEpochEnd",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getPendingEpoch",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getFinalizedEpoch",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getEpochDuration",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "getDecisionWindow",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "isDecisionWindowOpen",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "name": "epochProps",
        "outputs": [
            {"internalType": "uint32", "name": "from", "type": "uint32"},
            {"internalType": "uint32", "name": "to", "type": "uint32"},
            {"internalType": "uint64", "name": "fromTs", "type": "uint64"},
            {"internalType": "uint64", "name": "duration", "type": "uint64"},
            {"internalType": "uint64", "name": "decisionWindow", "type": "uint64"},
        ],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "epochPropsIndex",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "isStarted",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function",
    },
    {
        "inputs": [],
        "name": "start",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function",
    },
]
