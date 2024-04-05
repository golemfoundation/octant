from flask import current_app as app

from app.context.snapshots_state import SnapshotsState, get_snapshots_state
from app.extensions import cache
from app.context.epoch_details import get_epoch_details, EpochDetails
from app.context.epoch_state import EpochState, get_epoch_state, get_epoch_number
from app.context.projects import ProjectsDetails, get_projects_details
from app.engine.epochs_settings import get_epoch_settings, EpochSettings
from app.pydantic import Model
from app.shared.blockchain_types import compare_blockchain_types, ChainTypes


class Context(Model):
    epoch_state: EpochState
    epoch_details: EpochDetails
    epoch_settings: EpochSettings
    projects_details: ProjectsDetails
    snapshots_state: SnapshotsState


def epoch_context(epoch_num: int) -> Context:
    epoch_state = get_epoch_state(epoch_num)
    return build_context(epoch_num, epoch_state)


def state_context(epoch_state: EpochState, is_simulated: bool = False) -> Context:
    epoch_num = get_epoch_number(epoch_state)
    return build_context(epoch_num, epoch_state, is_simulated)


@cache.memoize(timeout=60)
def build_context(
    epoch_num: int, epoch_state: EpochState, is_simulated: bool = False
) -> Context:
    is_mainnet = compare_blockchain_types(app.config["CHAIN_ID"], ChainTypes.MAINNET)
    current_epoch_simulated = is_simulated and epoch_state.CURRENT

    epoch_details = get_epoch_details(
        epoch_num,
        epoch_state,
        with_block_range=is_mainnet,
        current_epoch_simulated=current_epoch_simulated,
    )
    epoch_settings = get_epoch_settings(epoch_num)
    projects_details = get_projects_details(epoch_num)
    snapshots_state = get_snapshots_state()

    context = Context(
        epoch_state=epoch_state,
        epoch_details=epoch_details,
        epoch_settings=epoch_settings,
        projects_details=projects_details,
        snapshots_state=snapshots_state,
    )

    app.logger.debug(
        f"Epoch num: {epoch_details.epoch_num}, epoch state: {epoch_state}"
    )
    return context
