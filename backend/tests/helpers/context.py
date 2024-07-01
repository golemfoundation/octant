from app.context.epoch.details import EpochDetails
from app.context.epoch_state import EpochState
from app.context.manager import Context
from app.context.projects import ProjectsDetails
from app.context.snapshots_state import SnapshotsState
from app.engine.epochs_settings import get_epoch_settings


def get_epoch_details(
    epoch_num: int,
    start=1000,
    duration=1000,
    decision_window=500,
    remaining_sec=1000,
    start_block=1000,
    end_block=2000,
    **kwargs
):
    return EpochDetails(
        epoch_num=epoch_num,
        duration=duration,
        start=start,
        decision_window=decision_window,
        remaining_sec=remaining_sec,
        start_block=start_block,
        end_block=end_block,
    )


def get_project_details(projects=None, **kwargs) -> ProjectsDetails:
    if not projects:
        projects = [
            "0xBcd4042DE499D14e55001CcbB24a551F3b954096",
            "0x71bE63f3384f5fb98995898A86B02Fb2426c5788",
            "0xFABB0ac9d68B0B445fB7357272Ff202C5651694a",
            "0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec",
            "0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097",
            "0xcd3B766CCDd6AE721141F452C550Ca635964ce71",
            "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
            "0xbDA5747bFD65F08deb54cb465eB87D40e51B197E",
            "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
            "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
        ]
    return ProjectsDetails(projects=projects)


def get_snapshot_state(
    last_pending_snapshot_num=0, last_finalized_snapshot_num=0, **kwargs
) -> SnapshotsState:
    return SnapshotsState(
        last_pending_snapshot_num=last_pending_snapshot_num,
        last_finalized_snapshot_num=last_finalized_snapshot_num,
    )


def get_context(
    epoch_num: int = 1, epoch_state: EpochState = EpochState.CURRENT, **kwargs
) -> Context:
    epoch_details = get_epoch_details(epoch_num, **kwargs)
    epoch_settings = get_epoch_settings(epoch_num)
    projects_details = get_project_details(**kwargs)
    snapshot_state = get_snapshot_state(**kwargs)

    return Context(
        epoch_state=epoch_state,
        epoch_details=epoch_details,
        epoch_settings=epoch_settings,
        projects_details=projects_details,
        snapshots_state=snapshot_state,
    )
