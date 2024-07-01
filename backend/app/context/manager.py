from flask import current_app as app

from app.context.epoch.details import EpochDetails
from app.context.epoch.factory import get_epoch_details
from app.context.snapshots_state import SnapshotsState, get_snapshots_state
from app.extensions import cache
from app.context.epoch_state import EpochState, get_epoch_state, get_epoch_number
from app.context.projects import ProjectsDetails, get_projects_details
from app.engine.epochs_settings import get_epoch_settings, EpochSettings
from app.pydantic import Model


class Context(Model):
    epoch_state: EpochState
    epoch_details: EpochDetails
    epoch_settings: EpochSettings
    projects_details: ProjectsDetails
    snapshots_state: SnapshotsState


@cache.memoize(timeout=15)
def epoch_context(epoch_num: int, with_block_range: bool = False) -> Context:
    epoch_state = get_epoch_state(epoch_num)
    return build_context(epoch_num, epoch_state, with_block_range)


def state_context(epoch_state: EpochState, with_block_range: bool = False) -> Context:
    epoch_num = get_epoch_number(epoch_state)
    return build_context(epoch_num, epoch_state, with_block_range)


@cache.memoize(timeout=60)
def build_context(
    epoch_num: int,
    epoch_state: EpochState,
    with_block_range: bool = False,
) -> Context:
    epoch_details = get_epoch_details(epoch_num, epoch_state, with_block_range)
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
