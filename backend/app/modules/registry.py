from typing import Dict, Any

from app.context.epoch_state import EpochState
from app.modules.modules_factory.current import CurrentServices
from app.modules.modules_factory.finalized import FinalizedServices
from app.modules.modules_factory.finalizing import FinalizingServices
from app.modules.modules_factory.future import FutureServices
from app.modules.modules_factory.pending import PendingServices
from app.modules.modules_factory.pre_pending import PrePendingServices

SERVICE_REGISTRY: Dict[EpochState, Any] = {}


def get_services(epoch_state: EpochState):
    return SERVICE_REGISTRY[epoch_state]


def register_services(app):
    chain_id = app.config["CHAIN_ID"]

    SERVICE_REGISTRY[EpochState.FUTURE] = FutureServices.create()
    SERVICE_REGISTRY[EpochState.CURRENT] = CurrentServices.create(chain_id)
    SERVICE_REGISTRY[EpochState.PRE_PENDING] = PrePendingServices.create(chain_id)
    SERVICE_REGISTRY[EpochState.PENDING] = PendingServices.create(chain_id)
    SERVICE_REGISTRY[EpochState.FINALIZING] = FinalizingServices.create()
    SERVICE_REGISTRY[EpochState.FINALIZED] = FinalizedServices.create()
