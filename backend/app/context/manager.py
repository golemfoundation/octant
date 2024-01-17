from dataclasses import dataclass

from flask import current_app as app

from app.context.epoch_details import get_epoch_details, EpochDetails
from app.context.epoch_state import EpochState, get_epoch_state, get_epoch_number
from app.context.projects import ProjectsDetails, get_projects_details
from app.engine.epochs_settings import get_epoch_settings, EpochSettings


@dataclass
class Context:
    epoch_state: EpochState
    epoch_details: EpochDetails
    epoch_settings: EpochSettings
    projects_details: ProjectsDetails


def epoch_context(epoch_num: int) -> Context:
    epoch_state = get_epoch_state(epoch_num)
    return build_context(epoch_num, epoch_state)


def state_context(epoch_state: EpochState) -> Context:
    epoch_num = get_epoch_number(epoch_state)
    return build_context(epoch_num, epoch_state)


def build_context(epoch_num: int, epoch_state: EpochState) -> Context:
    epoch_details = get_epoch_details(epoch_num, epoch_state)
    epoch_settings = get_epoch_settings(epoch_num)
    projects_details = get_projects_details(epoch_num)
    context = Context(
        epoch_state=epoch_state,
        epoch_details=epoch_details,
        epoch_settings=epoch_settings,
        projects_details=projects_details,
    )

    app.logger.debug(
        f"Epoch num: {epoch_details.epoch_num}, epoch state: {epoch_state}"
    )
    return context
